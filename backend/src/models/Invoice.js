const mongoose = require("mongoose");
const { INVOICE } = require("../constants/status");

const invoiceSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: Object.values(INVOICE), default: INVOICE.UNPAID },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
