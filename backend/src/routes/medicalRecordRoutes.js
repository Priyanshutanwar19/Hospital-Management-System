const express = require("express");
const medicalRecordController = require("../controllers/medicalRecordController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);
router.get("/", authorize("admin", "doctor", "receptionist", "patient"), medicalRecordController.getMedicalRecords);
router.get("/:id", authorize("admin", "doctor", "receptionist", "patient"), medicalRecordController.getMedicalRecordById);
router.post("/", authorize("doctor"), medicalRecordController.createMedicalRecord);

module.exports = router;
