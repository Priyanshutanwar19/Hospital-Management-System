const Receptionist = require("../models/Receptionist");
const User = require("../models/User");
const apiResponse = require("../utils/apiResponse");

const getReceptionists = async (req, res, next) => {
  try {
    const receptionists = await Receptionist.find().populate("userId", "name email");
    res.json(apiResponse({ success: true, message: "Receptionists retrieved", data: receptionists }));
  } catch (error) {
    next(error);
  }
};

const getReceptionistById = async (req, res, next) => {
  try {
    const receptionist = await Receptionist.findById(req.params.id).populate("userId", "name email");
    if (!receptionist) return res.status(404).json(apiResponse({ success: false, message: "Receptionist not found" }));
    res.json(apiResponse({ success: true, message: "Receptionist retrieved", data: receptionist }));
  } catch (error) {
    next(error);
  }
};

const createReceptionist = async (req, res, next) => {
  try {
    const { name, email, password, shift, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json(apiResponse({ success: false, message: "Email already in use" }));

    const user = await User.create({ name, email, password, role: "receptionist" });
    const receptionist = await Receptionist.create({ userId: user._id, shift, phone });

    res.status(201).json(apiResponse({ success: true, message: "Receptionist created", data: { user, receptionist } }));
  } catch (error) {
    next(error);
  }
};

const updateReceptionist = async (req, res, next) => {
  try {
    const receptionist = await Receptionist.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!receptionist) return res.status(404).json(apiResponse({ success: false, message: "Receptionist not found" }));
    res.json(apiResponse({ success: true, message: "Receptionist updated", data: receptionist }));
  } catch (error) {
    next(error);
  }
};

const deleteReceptionist = async (req, res, next) => {
  try {
    const receptionist = await Receptionist.findByIdAndDelete(req.params.id);
    if (!receptionist) return res.status(404).json(apiResponse({ success: false, message: "Receptionist not found" }));
    await User.findByIdAndDelete(receptionist.userId);
    res.json(apiResponse({ success: true, message: "Receptionist deleted" }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getReceptionists, getReceptionistById, createReceptionist, updateReceptionist, deleteReceptionist };
