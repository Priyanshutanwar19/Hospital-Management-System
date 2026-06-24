const express = require("express");
const appointmentController = require("../controllers/appointmentController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);
router.get("/", authorize("admin", "doctor", "receptionist", "patient"), appointmentController.getAppointments);
router.get("/:id", authorize("admin", "doctor", "receptionist", "patient"), appointmentController.getAppointmentById);
router.post("/", authorize("admin", "receptionist", "patient"), appointmentController.createAppointment);
router.put("/:id", authorize("admin", "doctor", "receptionist", "patient"), appointmentController.updateAppointment);
router.patch("/:id/cancel", authorize("admin", "doctor", "receptionist", "patient"), appointmentController.cancelAppointment);

module.exports = router;
