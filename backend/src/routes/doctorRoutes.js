const express = require("express");
const doctorController = require("../controllers/doctorController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("admin", "receptionist"), doctorController.getDoctors);
router.get("/:id", authorize("admin", "doctor", "receptionist"), doctorController.getDoctorById);
router.post("/", authorize("admin"), doctorController.createDoctor);
router.put("/:id", authorize("admin", "doctor"), doctorController.updateDoctor);
router.delete("/:id", authorize("admin"), doctorController.deleteDoctor);
router.patch("/:id/availability", authorize("doctor"), doctorController.updateAvailability);

module.exports = router;
