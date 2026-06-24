const express = require("express");
const prescriptionController = require("../controllers/prescriptionController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);
router.get("/", authorize("admin", "doctor", "receptionist", "patient"), prescriptionController.getPrescriptions);
router.get("/:id", authorize("admin", "doctor", "receptionist", "patient"), prescriptionController.getPrescriptionById);
router.post("/", authorize("doctor"), prescriptionController.createPrescription);

module.exports = router;
