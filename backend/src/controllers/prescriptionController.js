const Prescription = require("../models/Prescription");
const apiResponse = require("../utils/apiResponse");

const getPrescriptions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;
    const prescriptions = await Prescription.find(filter);
    res.json(apiResponse({ success: true, message: "Prescriptions retrieved", data: prescriptions }));
  } catch (error) {
    next(error);
  }
};

const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json(apiResponse({ success: false, message: "Prescription not found" }));
    res.json(apiResponse({ success: true, message: "Prescription retrieved", data: prescription }));
  } catch (error) {
    next(error);
  }
};

const createPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.create(req.body);
    res.status(201).json(apiResponse({ success: true, message: "Prescription created", data: prescription }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getPrescriptions, getPrescriptionById, createPrescription };
