const crypto = require("crypto");
const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Receptionist = require("../models/Receptionist");
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require("../services/tokenService");
const { sendEmail } = require("../services/emailService");
const apiResponse = require("../utils/apiResponse");
const { verifyToken } = require("../utils/jwt");
const { OAuth2Client } = require("google-auth-library");

// Helper function to resolve role-specific profile IDs
const getProfileId = async (user) => {
  if (!user) return null;
  if (user.role === "patient") {
    const profile = await Patient.findOne({ userId: user._id });
    return profile ? profile._id : null;
  } else if (user.role === "doctor") {
    const profile = await Doctor.findOne({ userId: user._id });
    return profile ? profile._id : null;
  } else if (user.role === "receptionist") {
    const profile = await Receptionist.findOne({ userId: user._id });
    return profile ? profile._id : null;
  }
  return null;
};

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      age,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      specialization,
      qualification,
      experience,
      consultationFee,
      availability,
      shift,
      phone
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json(apiResponse({ success: false, message: "Email already in use" }));
    }

    const user = await User.create({ name, email, password, role: role || "patient" });
    let profileId = null;

    if (user.role === "doctor") {
      const doc = await Doctor.create({ userId: user._id, specialization, qualification, experience, consultationFee, availability });
      profileId = doc._id;
    } else if (user.role === "patient") {
      const pat = await Patient.create({ userId: user._id, age, gender, bloodGroup, address, emergencyContact });
      profileId = pat._id;
    } else if (user.role === "receptionist") {
      const rec = await Receptionist.create({ userId: user._id, shift, phone });
      profileId = rec._id;
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json(
      apiResponse({
        success: true,
        message: "Registration successful",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            patientId: user.role === "patient" ? profileId : undefined,
            doctorId: user.role === "doctor" ? profileId : undefined,
            receptionistId: user.role === "receptionist" ? profileId : undefined
          },
          accessToken,
          refreshToken
        },
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

    const profileId = await getProfileId(user);

    res.json(
      apiResponse({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            patientId: user.role === "patient" ? profileId : undefined,
            doctorId: user.role === "doctor" ? profileId : undefined,
            receptionistId: user.role === "receptionist" ? profileId : undefined
          },
          accessToken,
          refreshToken
        },
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

    // Send reset email, catch errors to print if SMTP configuration is missing
    try {
      await sendEmail({
        to: user.email,
        subject: "SmartCare Password Reset",
        html: `<p>Click the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      });
      console.log(`Password reset email sent to ${user.email}. Link: ${resetUrl}`);
    } catch (emailError) {
      console.error("Nodemailer failed, printing reset URL to console instead:");
      console.log(`-----------------------------------------------`);
      console.log(`RESET LINK FOR ${user.email}: ${resetUrl}`);
      console.log(`-----------------------------------------------`);
    }

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
    const { oldPassword, newPassword } = req.body;
    // Get user from authentication middleware
    const user = await User.findById(req.user._id);
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

const currentUser = async (req, res, next) => {
  try {
    // Rely on authenticating middleware req.user
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json(apiResponse({ success: false, message: "User not found" }));
    }
    const profileId = await getProfileId(user);
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      patientId: user.role === "patient" ? profileId : undefined,
      doctorId: user.role === "doctor" ? profileId : undefined,
      receptionistId: user.role === "receptionist" ? profileId : undefined
    };
    res.json(apiResponse({ success: true, message: "User retrieved", data: userData }));
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json(apiResponse({ success: false, message: "Google ID token is required" }));
    }

    let email, name, picture;

    // Use verification client if Client ID is configured
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "your_google_client_id") {
      try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
      } catch (err) {
        return res.status(400).json(apiResponse({ success: false, message: "Google signature verification failed: " + err.message }));
      }
    } else {
      // Sandbox / Test Mode: Decode or extract fake email
      console.warn("GOOGLE_CLIENT_ID is not configured. Running Google Auth in mock/sandbox mode.");
      if (idToken.includes("@")) {
        email = idToken.toLowerCase().trim();
        name = idToken.split("@")[0].replace(/[^a-zA-Z]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      } else {
        email = "google.test.user@smartcare.com";
        name = "Google Sandbox Patient";
      }
      picture = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80";
    }

    let user = await User.findOne({ email });
    let isNewUser = false;
    let profileId = null;

    if (!user) {
      isNewUser = true;
      const randomPassword = crypto.randomBytes(16).toString("hex");
      user = await User.create({
        name,
        email,
        password: randomPassword,
        role: "patient",
        profileImage: picture,
      });

      const pat = await Patient.create({
        userId: user._id,
        age: 30,
        gender: "Not Specified",
        bloodGroup: "O+",
        address: "Signed up via Google",
        emergencyContact: "0000000000",
      });
      profileId = pat._id;
    } else {
      profileId = await getProfileId(user);
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json(
      apiResponse({
        success: true,
        message: isNewUser ? "Google sign-up successful" : "Google sign-in successful",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            patientId: user.role === "patient" ? profileId : undefined,
            doctorId: user.role === "doctor" ? profileId : undefined,
            receptionistId: user.role === "receptionist" ? profileId : undefined
          },
          accessToken,
          refreshToken
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  currentUser,
  googleLogin
};
