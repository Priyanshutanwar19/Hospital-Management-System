const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const apiResponse = require("../utils/apiResponse");
const { APPOINTMENT } = require("../constants/status");

const getAppointments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.status) filter.status = req.query.status;

    const appointments = await Appointment.find(filter)
      .populate("doctorId", "specialization qualification")
      .populate("patientId", "age gender bloodGroup");

    res.json(apiResponse({ success: true, message: "Appointments retrieved", data: appointments }));
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId", "specialization qualification")
      .populate("patientId", "age gender bloodGroup");
    if (!appointment) return res.status(404).json(apiResponse({ success: false, message: "Appointment not found" }));
    res.json(apiResponse({ success: true, message: "Appointment retrieved", data: appointment }));
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, appointmentDate, slot } = req.body;
    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);
    if (!doctor || !patient) return res.status(404).json(apiResponse({ success: false, message: "Doctor or patient not found" }));

    if (!doctor.availability.includes(slot)) {
      return res.status(400).json(apiResponse({ success: false, message: "Doctor not available at selected slot" }));
    }

    const collision = await Appointment.findOne({ doctorId, appointmentDate, slot });
    if (collision) {
      return res.status(409).json(apiResponse({ success: false, message: "Slot already booked" }));
    }

    const appointment = await Appointment.create({ patientId, doctorId, appointmentDate, slot, status: APPOINTMENT.CONFIRMED });
    res.status(201).json(apiResponse({ success: true, message: "Appointment created", data: appointment }));
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json(apiResponse({ success: false, message: "Appointment not found" }));

    Object.assign(appointment, req.body);
    if (req.body.doctorId && req.body.appointmentDate && req.body.slot) {
      const collision = await Appointment.findOne({ doctorId: req.body.doctorId, appointmentDate: req.body.appointmentDate, slot: req.body.slot, _id: { $ne: appointment._id } });
      if (collision) {
        return res.status(409).json(apiResponse({ success: false, message: "Slot already booked" }));
      }
    }

    await appointment.save();
    res.json(apiResponse({ success: true, message: "Appointment updated", data: appointment }));
  } catch (error) {
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json(apiResponse({ success: false, message: "Appointment not found" }));
    appointment.status = APPOINTMENT.CANCELLED;
    await appointment.save();
    res.json(apiResponse({ success: true, message: "Appointment cancelled", data: appointment }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getAppointments, getAppointmentById, createAppointment, updateAppointment, cancelAppointment };
