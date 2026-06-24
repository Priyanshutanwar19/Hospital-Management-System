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
    const doctor = await Doctor.create(req.body);
    res.status(201).json(apiResponse({ success: true, message: "Doctor created", data: doctor }));
  } catch (error) {
    next(error);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
    doctor.availability = req.body.availability || doctor.availability;
    await doctor.save();
    res.json(apiResponse({ success: true, message: "Availability updated", data: doctor }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor, updateAvailability };
