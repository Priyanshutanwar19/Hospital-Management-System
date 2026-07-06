const { body } = require("express-validator");

const appointmentValidator = [
  body("patientId").isMongoId().withMessage("Valid Patient ID is required"),
  body("doctorId").isMongoId().withMessage("Valid Doctor ID is required"),
  body("appointmentDate").isISO8601().withMessage("Valid appointment date is required"),
  body("slot").notEmpty().withMessage("Time slot is required")
];

const medicalRecordValidator = [
  body("patientId").isMongoId().withMessage("Valid Patient ID is required"),
  body("doctorId").isMongoId().withMessage("Valid Doctor ID is required"),
  body("diagnosis").notEmpty().trim().withMessage("Diagnosis is required"),
  body("symptoms").notEmpty().trim().withMessage("Symptoms description is required"),
  body("treatment").notEmpty().trim().withMessage("Treatment description is required"),
  body("notes").optional().trim(),
  body("attachments").optional().isArray().withMessage("Attachments must be an array of URLs")
];

const prescriptionValidator = [
  body("patientId").isMongoId().withMessage("Valid Patient ID is required"),
  body("doctorId").isMongoId().withMessage("Valid Doctor ID is required"),
  body("medicines").isArray({ min: 1 }).withMessage("At least one medicine is required"),
  body("medicines.*.name").notEmpty().withMessage("Medicine name is required"),
  body("medicines.*.dosage").notEmpty().withMessage("Dosage is required"),
  body("medicines.*.frequency").notEmpty().withMessage("Frequency is required"),
  body("instructions").optional().trim(),
  body("attachments").optional().isArray().withMessage("Attachments must be an array of URLs")
];

const invoiceValidator = [
  body("patientId").isMongoId().withMessage("Valid Patient ID is required"),
  body("appointmentId").isMongoId().withMessage("Valid Appointment ID is required"),
  body("amount").isFloat({ min: 0 }).withMessage("Amount must be a positive number"),
  body("dueDate").optional().isISO8601().withMessage("Valid due date is required")
];

module.exports = {
  appointmentValidator,
  medicalRecordValidator,
  prescriptionValidator,
  invoiceValidator
};
