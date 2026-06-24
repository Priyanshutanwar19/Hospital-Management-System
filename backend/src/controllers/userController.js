const User = require("../models/User");
const apiResponse = require("../utils/apiResponse");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("name email role createdAt");
    res.json(apiResponse({ success: true, message: "Users retrieved", data: users }));
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("name email role createdAt");
    if (!user) {
      return res.status(404).json(apiResponse({ success: false, message: "User not found" }));
    }
    res.json(apiResponse({ success: true, message: "User retrieved", data: user }));
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select("name email role createdAt");
    if (!updated) {
      return res.status(404).json(apiResponse({ success: false, message: "User not found" }));
    }
    res.json(apiResponse({ success: true, message: "User updated", data: updated }));
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json(apiResponse({ success: false, message: "User not found" }));
    }
    res.json(apiResponse({ success: true, message: "User deleted" }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
