const Doctor = require("../models/Doctor");
const User = require("../models/User");
const apiResponse = require("../utils/apiResponse");

const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().populate("userId", "name email");
    res.json(apiResponse({ success: true, message: "Doctors retrieved", data: doctors }));
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("userId", "name email");
    if (!doctor) return res.status(404).json(apiResponse({ success: false, message: "Doctor not found" }));
    res.json(apiResponse({ success: true, message: "Doctor retrieved", data: doctor }));
  } catch (error) {
    next(error);
  }
};

const createDoctor = async (req, res, next) => {
  try {
    // Check if user already exists
    const { name, email, password, specialization, qualification, experience, consultationFee, availability } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json(apiResponse({ success: false, message: "Email already in use" }));

    const user = await User.create({ name, email, password, role: "doctor" });
    const doctor = await Doctor.create({
      userId: user._id,
      specialization,
      qualification,
      experience,
      consultationFee,
      availability
    });
    res.status(201).json(apiResponse({ success: true, message: "Doctor created", data: { user, doctor } }));
  } catch (error) {
    next(error);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    if (req.user.role === "doctor") {
      const myDoctorProfile = await Doctor.findOne({ userId: req.user._id });
      if (!myDoctorProfile || myDoctorProfile._id.toString() !== req.params.id) {
        return res.status(403).json(apiResponse({ success: false, message: "Forbidden: You can only update your own profile" }));
      }
    }
    const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate("userId", "name email");
    if (!updated) return res.status(404).json(apiResponse({ success: false, message: "Doctor not found" }));
    res.json(apiResponse({ success: true, message: "Doctor updated", data: updated }));
  } catch (error) {
    next(error);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    const deleted = await Doctor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json(apiResponse({ success: false, message: "Doctor not found" }));
    await User.findByIdAndDelete(deleted.userId);
    res.json(apiResponse({ success: true, message: "Doctor removed" }));
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json(apiResponse({ success: false, message: "Doctor not found" }));

    if (req.user.role === "doctor" && doctor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json(apiResponse({ success: false, message: "Forbidden: You can only update your own availability" }));
    }

    doctor.availability = req.body.availability || doctor.availability;
    await doctor.save();
    res.json(apiResponse({ success: true, message: "Availability updated", data: doctor }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor, updateAvailability };
