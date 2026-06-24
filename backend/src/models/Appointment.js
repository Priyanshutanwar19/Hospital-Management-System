const mongoose = require("mongoose");
const { APPOINTMENT } = require("../constants/status");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentDate: { type: Date, required: true },
    slot: { type: String, required: true },
    status: { type: String, enum: Object.values(APPOINTMENT), default: APPOINTMENT.PENDING },
    notes: { type: String },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, appointmentDate: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
