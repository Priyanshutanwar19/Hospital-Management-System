const Invoice = require("../models/Invoice");
const Patient = require("../models/Patient");
const apiResponse = require("../utils/apiResponse");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Setup razorpay client (fall back to mock client if credentials are not configured)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_ID !== "your_razorpay_key_id") {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing/default. Running payments in mock/sandbox mode.");
}

const getInvoices = async (req, res, next) => {
  try {
    const filter = {};
    
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) {
        return res.json(apiResponse({ success: true, message: "Invoices retrieved", data: [] }));
      }
      filter.patientId = patient._id;
    } else {
      if (req.query.patientId) filter.patientId = req.query.patientId;
    }

    if (req.query.appointmentId) filter.appointmentId = req.query.appointmentId;

    const invoices = await Invoice.find(filter)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "appointmentId",
        populate: {
          path: "doctorId",
          populate: { path: "userId", select: "name" }
        }
      })
      .sort({ createdAt: -1 });

    res.json(apiResponse({ success: true, message: "Invoices retrieved", data: invoices }));
  } catch (error) {
    next(error);
  }
};

const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "appointmentId",
        populate: {
          path: "doctorId",
          populate: { path: "userId", select: "name" }
        }
      });

    if (!invoice) return res.status(404).json(apiResponse({ success: false, message: "Invoice not found" }));

    // Security check
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || invoice.patientId._id.toString() !== patient._id.toString()) {
        return res.status(403).json(apiResponse({ success: false, message: "Forbidden: Access denied" }));
      }
    }

    res.json(apiResponse({ success: true, message: "Invoice retrieved", data: invoice }));
  } catch (error) {
    next(error);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const { patientId, appointmentId, amount, dueDate } = req.body;
    const invoice = await Invoice.create({
      patientId,
      appointmentId,
      amount,
      dueDate: dueDate || new Date(Date.now() + 86400000),
      status: "unpaid"
    });
    res.status(201).json(apiResponse({ success: true, message: "Invoice created", data: invoice }));
  } catch (error) {
    next(error);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!invoice) return res.status(404).json(apiResponse({ success: false, message: "Invoice not found" }));
    res.json(apiResponse({ success: true, message: "Invoice updated", data: invoice }));
  } catch (error) {
    next(error);
  }
};

const createRazorpayOrder = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json(apiResponse({ success: false, message: "Invoice not found" }));
    if (invoice.status === "paid") {
      return res.status(400).json(apiResponse({ success: false, message: "Invoice is already paid" }));
    }

    const amountInPaise = Math.round(invoice.amount * 100);

    if (razorpay) {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: invoice._id.toString(),
      });
      invoice.razorpayOrderId = order.id;
      await invoice.save();
      const orderWithKey = {
        ...order,
        keyId: process.env.RAZORPAY_KEY_ID
      };
      return res.json(apiResponse({ success: true, message: "Razorpay order created", data: orderWithKey }));
    } else {
      // Mock flow
      const mockOrderId = `order_mock_${crypto.randomBytes(8).toString("hex")}`;
      invoice.razorpayOrderId = mockOrderId;
      await invoice.save();
      return res.json(apiResponse({
        success: true,
        message: "Razorpay order created (MOCK)",
        data: {
          id: mockOrderId,
          amount: amountInPaise,
          currency: "INR",
          receipt: invoice._id.toString(),
          isMock: true,
          keyId: "mock_key_id"
        }
      }));
    }
  } catch (error) {
    next(error);
  }
};

const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    // Find invoice
    const invoice = await Invoice.findOne({ razorpayOrderId: razorpay_order_id });
    if (!invoice) {
      return res.status(404).json(apiResponse({ success: false, message: "Invoice not found for this order" }));
    }

    if (razorpay) {
      const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest("hex");
      if (digest !== razorpay_signature) {
        return res.status(400).json(apiResponse({ success: false, message: "Payment verification failed" }));
      }
    } else {
      console.log("Mock payment verified for invoice:", invoice._id);
    }

    invoice.status = "paid";
    invoice.razorpayPaymentId = razorpay_payment_id || `pay_mock_${crypto.randomBytes(8).toString("hex")}`;
    invoice.razorpaySignature = razorpay_signature || `sig_mock_${crypto.randomBytes(8).toString("hex")}`;
    await invoice.save();

    // Trigger notification
    const Notification = require("../models/Notification");
    const patientProfile = await Patient.findById(invoice.patientId);
    if (patientProfile) {
      await Notification.create({
        userId: patientProfile.userId,
        title: "Payment Received",
        message: `Your payment of INR ${invoice.amount} for appointment billing has been successfully received.`
      });
    }

    res.json(apiResponse({ success: true, message: "Payment verified successfully", data: invoice }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  createRazorpayOrder,
  verifyRazorpayPayment
};
