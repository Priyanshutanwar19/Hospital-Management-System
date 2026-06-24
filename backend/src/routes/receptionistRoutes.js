const express = require("express");
const receptionistController = require("../controllers/receptionistController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);
router.get("/", authorize("admin"), receptionistController.getReceptionists);
router.get("/:id", authorize("admin", "receptionist"), receptionistController.getReceptionistById);
router.post("/", authorize("admin"), receptionistController.createReceptionist);
router.put("/:id", authorize("admin", "receptionist"), receptionistController.updateReceptionist);
router.delete("/:id", authorize("admin"), receptionistController.deleteReceptionist);

module.exports = router;
