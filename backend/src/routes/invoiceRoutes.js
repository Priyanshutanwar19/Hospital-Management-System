const express = require("express");
const invoiceController = require("../controllers/invoiceController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { invoiceValidator } = require("../validators");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("admin", "receptionist", "patient"), invoiceController.getInvoices);
router.get("/:id", authorize("admin", "receptionist", "patient"), invoiceController.getInvoiceById);

router.post(
  "/",
  authorize("admin", "receptionist"),
  invoiceValidator,
  validateRequest,
  invoiceController.createInvoice
);

router.put(
  "/:id",
  authorize("admin", "receptionist"),
  invoiceController.updateInvoice
);

router.post("/:id/pay", authorize("admin", "receptionist", "patient"), invoiceController.createRazorpayOrder);
router.post("/:id/verify", authorize("admin", "receptionist", "patient"), invoiceController.verifyRazorpayPayment);

module.exports = router;
