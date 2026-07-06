const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const User = require("../models/User");
const Invoice = require("../models/Invoice");
const apiResponse = require("../utils/apiResponse");
const { APPOINTMENT } = require("../constants/status");
const { sendEmail } = require("../services/emailService");

const getAppointments = async (req, res, next) => {
  try {
    const filter = {};
    
    // Role-based authorization filters
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) {
        return res.json(apiResponse({ success: true, message: "Appointments retrieved", data: [] }));
      }
      filter.patientId = patient._id;
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.json(apiResponse({ success: true, message: "Appointments retrieved", data: [] }));
      }
      filter.doctorId = doctor._id;
    } else {
      // Admins and receptionists can filter dynamically via query parameters
      if (req.query.doctorId) filter.doctorId = req.query.doctorId;
      if (req.query.patientId) filter.patientId = req.query.patientId;
    }

    if (req.query.status) filter.status = req.query.status;

    const appointments = await Appointment.find(filter)
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email" }
      })
      .sort({ appointmentDate: 1, slot: 1 });

    res.json(apiResponse({ success: true, message: "Appointments retrieved", data: appointments }));
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email" }
      });

    if (!appointment) return res.status(404).json(apiResponse({ success: false, message: "Appointment not found" }));

    // Verify access rights
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || appointment.patientId._id.toString() !== patient._id.toString()) {
        return res.status(403).json(apiResponse({ success: false, message: "Forbidden: Access denied" }));
      }
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || appointment.doctorId._id.toString() !== doctor._id.toString()) {
        return res.status(403).json(apiResponse({ success: false, message: "Forbidden: Access denied" }));
      }
    }

    res.json(apiResponse({ success: true, message: "Appointment retrieved", data: appointment }));
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, appointmentDate, slot, notes } = req.body;
    const doctor = await Doctor.findById(doctorId).populate("userId", "name email");
    const patient = await Patient.findById(patientId).populate("userId", "name email");
    if (!doctor || !patient) return res.status(404).json(apiResponse({ success: false, message: "Doctor or patient not found" }));

    // Check availability array
    if (!doctor.availability.includes(slot)) {
      return res.status(400).json(apiResponse({ success: false, message: "Doctor not available at selected slot" }));
    }

    // Check collision (ignore cancelled / rescheduled)
    const collision = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      slot,
      status: { $nin: [APPOINTMENT.CANCELLED, APPOINTMENT.RESCHEDULED] }
    });
    if (collision) {
      return res.status(409).json(apiResponse({ success: false, message: "Slot already booked by another appointment" }));
    }

    // Check patient collision (prevent patient from double-booking themselves in the same slot)
    const patientCollision = await Appointment.findOne({
      patientId,
      appointmentDate: new Date(appointmentDate),
      slot,
      status: { $nin: [APPOINTMENT.CANCELLED, APPOINTMENT.RESCHEDULED] }
    });
    if (patientCollision) {
      return res.status(400).json(apiResponse({ success: false, message: "You already have another appointment booked for this slot" }));
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      slot,
      status: APPOINTMENT.CONFIRMED,
      notes
    });

    // Auto-generate invoice for consultation fee
    await Invoice.create({
      patientId,
      appointmentId: appointment._id,
      amount: doctor.consultationFee,
      status: "unpaid",
      dueDate: new Date(Date.now() + 86400000) // 24 hours
    });

    // Send confirmation email
    if (patient.userId && patient.userId.email) {
      try {
        await sendEmail({
          to: patient.userId.email,
          subject: "SmartCare - Appointment Confirmation",
          html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Appointment Confirmed!</h2>
            <p>Dear ${patient.userId.name},</p>
            <p>Your appointment with <strong>Dr. ${doctor.userId.name}</strong> (${doctor.specialization}) has been booked.</p>
            <table style="border-collapse: collapse; width: 100%; max-width: 400px; margin-top: 15px;">
              <tr><td style="padding: 8px 0; font-weight: bold;">Date:</td><td>${new Date(appointmentDate).toDateString()}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Slot:</td><td>${slot}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Fee:</td><td>INR ${doctor.consultationFee}</td></tr>
            </table>
            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">Please pay the consultation invoice on your dashboard.</p>
          </div>`
        });
      } catch (err) {
        console.error("Nodemailer failed to send email, proceeding:", err.message);
      }
    }

    res.status(201).json(apiResponse({ success: true, message: "Appointment booked and invoice generated", data: appointment }));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json(apiResponse({ success: false, message: "This slot has already been booked for this doctor. Please select another slot or date." }));
    }
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json(apiResponse({ success: false, message: "Appointment not found" }));

    // Check edit access
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
        return res.status(403).json(apiResponse({ success: false, message: "Forbidden: Access denied" }));
      }
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json(apiResponse({ success: false, message: "Forbidden: Access denied" }));
      }
    }

    const { doctorId, appointmentDate, slot, status, notes } = req.body;

    const checkDoctorId = doctorId || appointment.doctorId;
    const checkDate = appointmentDate ? new Date(appointmentDate) : appointment.appointmentDate;
    const checkSlot = slot || appointment.slot;

    // Check slot collision if rescheduling
    if (appointmentDate || slot || doctorId) {
      // Validate slot selection against doctor availability
      const doctorObj = await Doctor.findById(checkDoctorId);
      if (doctorObj && !doctorObj.availability.includes(checkSlot)) {
        return res.status(400).json(apiResponse({ success: false, message: "Doctor not available at selected slot" }));
      }

      const collision = await Appointment.findOne({
        doctorId: checkDoctorId,
        appointmentDate: checkDate,
        slot: checkSlot,
        status: { $nin: [APPOINTMENT.CANCELLED, APPOINTMENT.RESCHEDULED] },
        _id: { $ne: appointment._id }
      });
      if (collision) {
        return res.status(409).json(apiResponse({ success: false, message: "Slot already booked" }));
      }
    }

    Object.assign(appointment, req.body);
    await appointment.save();

    // Trigger email if rescheduled
    if (appointmentDate || slot) {
      const pat = await Patient.findById(appointment.patientId).populate("userId", "name email");
      const doc = await Doctor.findById(appointment.doctorId).populate("userId", "name");
      if (pat && pat.userId && pat.userId.email) {
        try {
          await sendEmail({
            to: pat.userId.email,
            subject: "SmartCare - Appointment Rescheduled",
            html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Appointment Rescheduled</h2>
              <p>Dear ${pat.userId.name},</p>
              <p>Your appointment with <strong>Dr. ${doc.userId.name}</strong> has been updated to:</p>
              <p><strong>New Date:</strong> ${new Date(appointment.appointmentDate).toDateString()}</p>
              <p><strong>New Slot:</strong> ${appointment.slot}</p>
            </div>`
          });
        } catch (err) {
          console.error("Nodemailer failed to send email, proceeding:", err.message);
        }
      }
    }

    res.json(apiResponse({ success: true, message: "Appointment updated", data: appointment }));
  } catch (error) {
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json(apiResponse({ success: false, message: "Appointment not found" }));

    // Check delete access
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
        return res.status(403).json(apiResponse({ success: false, message: "Forbidden: Access denied" }));
      }
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json(apiResponse({ success: false, message: "Forbidden: Access denied" }));
      }
    }

    appointment.status = APPOINTMENT.CANCELLED;
    await appointment.save();

    // Cancel related invoice if unpaid
    const invoice = await Invoice.findOne({ appointmentId: appointment._id, status: "unpaid" });
    if (invoice) {
      invoice.status = "cancelled"; // or just delete/cancel
      await invoice.save();
    }

    // Trigger cancel email
    const pat = await Patient.findById(appointment.patientId).populate("userId", "name email");
    const doc = await Doctor.findById(appointment.doctorId).populate("userId", "name");
    if (pat && pat.userId && pat.userId.email) {
      try {
        await sendEmail({
          to: pat.userId.email,
          subject: "SmartCare - Appointment Cancelled",
          html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Appointment Cancelled</h2>
            <p>Dear ${pat.userId.name},</p>
            <p>Your appointment with <strong>Dr. ${doc.userId.name}</strong> on ${new Date(appointment.appointmentDate).toDateString()} has been cancelled.</p>
          </div>`
        });
      } catch (err) {
        console.error("Nodemailer failed to send email, proceeding:", err.message);
      }
    }

    res.json(apiResponse({ success: true, message: "Appointment cancelled", data: appointment }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getAppointments, getAppointmentById, createAppointment, updateAppointment, cancelAppointment };
