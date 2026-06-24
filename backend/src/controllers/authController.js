const crypto = require("crypto");
const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Receptionist = require("../models/Receptionist");
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require("../services/tokenService");
const { sendEmail } = require("../services/emailService");
const apiResponse = require("../utils/apiResponse");

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, age, gender, bloodGroup, address, emergencyContact, specialization, qualification, experience, consultationFee, availability, shift, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json(apiResponse({ success: false, message: "Email already in use" }));
    }

    const user = await User.create({ name, email, password, role: role || "patient" });

    if (user.role === "doctor") {
      await Doctor.create({ userId: user._id, specialization, qualification, experience, consultationFee, availability });
    }

    if (user.role === "patient") {
      await Patient.create({ userId: user._id, age, gender, bloodGroup, address, emergencyContact });
    }

    if (user.role === "receptionist") {
      await Receptionist.create({ userId: user._id, shift, phone });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json(
      apiResponse({
        success: true,
        message: "Registration successful",
        data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken },
      })
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json(apiResponse({ success: false, message: "Invalid credentials" }));
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json(
      apiResponse({
        success: true,
        message: "Login successful",
        data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken },
      })
    );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json(apiResponse({ success: false, message: "Refresh token required" }));
    }
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json(apiResponse({ success: true, message: "Logged out successfully" }));
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json(apiResponse({ success: false, message: "Invalid refresh token" }));
    }

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json(apiResponse({ success: true, message: "Token refreshed", data: { accessToken: newAccessToken, refreshToken: newRefreshToken } }));
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json(apiResponse({ success: false, message: "User not found" }));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: "SmartCare Password Reset",
      html: `<p>Click the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.json(apiResponse({ success: true, message: "Password reset email sent" }));
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json(apiResponse({ success: false, message: "Invalid or expired token" }));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json(apiResponse({ success: true, message: "Password has been reset" }));
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(oldPassword))) {
      return res.status(401).json(apiResponse({ success: false, message: "Invalid current password" }));
    }

    user.password = newPassword;
    await user.save();

    res.json(apiResponse({ success: true, message: "Password changed successfully" }));
  } catch (error) {
    next(error);
  }
};

const { verifyToken } = require("../utils/jwt");

const currentUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json(apiResponse({ success: false, message: "Authentication token missing" }));
    }
    const payload = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return res.status(404).json(apiResponse({ success: false, message: "User not found" }));
    }
    res.json(apiResponse({ success: true, message: "User retrieved", data: user }));
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, refreshToken, forgotPassword, resetPassword, changePassword, currentUser };
