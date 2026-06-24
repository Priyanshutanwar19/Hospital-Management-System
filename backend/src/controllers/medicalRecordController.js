const MedicalRecord = require("../models/MedicalRecord");
const apiResponse = require("../utils/apiResponse");

const getMedicalRecords = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;
    const records = await MedicalRecord.find(filter).populate("patientId doctorId", "userId");
    res.json(apiResponse({ success: true, message: "Medical records retrieved", data: records }));
  } catch (error) {
    next(error);
  }
};

const getMedicalRecordById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json(apiResponse({ success: false, message: "Record not found" }));
    res.json(apiResponse({ success: true, message: "Medical record retrieved", data: record }));
  } catch (error) {
    next(error);
  }
};

const createMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.create(req.body);
    res.status(201).json(apiResponse({ success: true, message: "Medical record created", data: record }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getMedicalRecords, getMedicalRecordById, createMedicalRecord };
