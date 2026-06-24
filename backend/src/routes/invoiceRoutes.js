const express = require("express");
const invoiceController = require("../controllers/invoiceController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);
router.get("/", authorize("admin", "receptionist", "patient"), invoiceController.getInvoices);
router.get("/:id", authorize("admin", "receptionist", "patient"), invoiceController.getInvoiceById);
router.post("/", authorize("admin", "receptionist"), invoiceController.createInvoice);
router.put("/:id", authorize("admin", "receptionist"), invoiceController.updateInvoice);

module.exports = router;
