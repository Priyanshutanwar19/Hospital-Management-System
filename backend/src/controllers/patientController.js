const Patient = require("../models/Patient");
const User = require("../models/User");
const apiResponse = require("../utils/apiResponse");

const getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find().populate("userId", "name email");
    res.json(apiResponse({ success: true, message: "Patients retrieved", data: patients }));
  } catch (error) {
    next(error);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate("userId", "name email");
    if (!patient) return res.status(404).json(apiResponse({ success: false, message: "Patient not found" }));
    res.json(apiResponse({ success: true, message: "Patient retrieved", data: patient }));
  } catch (error) {
    next(error);
  }
};

const createPatient = async (req, res, next) => {
  try {
    const { name, email, password, age, gender, bloodGroup, address, emergencyContact } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json(apiResponse({ success: false, message: "Email already in use" }));

    const user = await User.create({ name, email, password, role: "patient" });
    const patient = await Patient.create({ userId: user._id, age, gender, bloodGroup, address, emergencyContact });

    res.status(201).json(apiResponse({ success: true, message: "Patient created", data: { user, patient } }));
  } catch (error) {
    next(error);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json(apiResponse({ success: false, message: "Patient not found" }));
    res.json(apiResponse({ success: true, message: "Patient updated", data: patient }));
  } catch (error) {
    next(error);
  }
};

const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json(apiResponse({ success: false, message: "Patient not found" }));
    await User.findByIdAndDelete(patient.userId);
    res.json(apiResponse({ success: true, message: "Patient deleted" }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getPatients, getPatientById, createPatient, updatePatient, deletePatient };
