const express = require("express");
const patientController = require("../controllers/patientController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("admin", "doctor", "receptionist"), patientController.getPatients);
router.get("/:id", authorize("admin", "doctor", "receptionist", "patient"), patientController.getPatientById);
router.post("/", authorize("admin", "receptionist"), patientController.createPatient);
router.put("/:id", authorize("admin", "doctor", "receptionist", "patient"), patientController.updatePatient);
router.delete("/:id", authorize("admin", "receptionist"), patientController.deletePatient);

module.exports = router;
