const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    medicines: [{ name: String, dosage: String, frequency: String }],
    instructions: { type: String },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
