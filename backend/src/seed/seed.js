const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Receptionist = require("../models/Receptionist");
const Appointment = require("../models/Appointment");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");
const Invoice = require("../models/Invoice");
const Notification = require("../models/Notification");

dotenv.config({ path: `${process.cwd()}/.env` });

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
};

const seed = async () => {
  try {
    await connectDB();
    await Promise.all([
      User.deleteMany(),
      Doctor.deleteMany(),
      Patient.deleteMany(),
      Receptionist.deleteMany(),
      Appointment.deleteMany(),
      MedicalRecord.deleteMany(),
      Prescription.deleteMany(),
      Invoice.deleteMany(),
      Notification.deleteMany(),
    ]);

    const adminUser = await User.create({ name: "Admin User", email: "admin@smartcare.com", password: "admin123", role: "admin" });
    const doctorUser = await User.create({ name: "Dr. Jane Smith", email: "doctor@smartcare.com", password: "doctor123", role: "doctor" });
    const patientUser = await User.create({ name: "John Doe", email: "patient@smartcare.com", password: "patient123", role: "patient" });
    const receptionistUser = await User.create({ name: "Receptionist Amy", email: "reception@smartcare.com", password: "reception123", role: "receptionist" });

    const patient = await Patient.create({ userId: patientUser._id, age: 34, gender: "Male", bloodGroup: "O+", address: "123 Main St", emergencyContact: "9999999999" });
    const doctor = await Doctor.create({ userId: doctorUser._id, specialization: "General Medicine", qualification: "MBBS, MD", experience: 8, consultationFee: 350, availability: ["09:00 AM", "11:00 AM", "02:00 PM"] });
    await Receptionist.create({ userId: receptionistUser._id, shift: "Morning", phone: "8888888888" });

    const appointment = await Appointment.create({ patientId: patient._id, doctorId: doctor._id, appointmentDate: new Date(Date.now() + 86400000), slot: "09:00 AM", status: "confirmed" });

    await MedicalRecord.create({ patientId: patient._id, doctorId: doctor._id, diagnosis: "Seasonal cold", symptoms: "Cough and mild fever", treatment: "Rest and hydration", notes: "Follow up in one week" });
    await Prescription.create({ patientId: patient._id, doctorId: doctor._id, medicines: [{ name: "Paracetamol", dosage: "500mg", frequency: "Twice daily" }], instructions: "Take after meals" });
    await Invoice.create({ patientId: patient._id, appointmentId: appointment._id, amount: 350, status: "pending", dueDate: new Date(Date.now() + 259200000) });
    await Notification.create({ userId: patientUser._id, title: "Appointment confirmed", message: "Your appointment is confirmed for tomorrow at 09:00 AM" });

    console.log("Seed data created successfully");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
