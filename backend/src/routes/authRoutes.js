const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").optional().isIn(["admin", "doctor", "patient", "receptionist"]),
  ],
  validateRequest,
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validateRequest,
  authController.login
);

router.post(
  "/google",
  [
    body("idToken").notEmpty().withMessage("idToken is required")
  ],
  validateRequest,
  authController.googleLogin
);

router.post(
  "/refresh-token",
  [body("refreshToken").notEmpty().withMessage("Refresh token is required")],
  validateRequest,
  authController.refreshToken
);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required")],
  validateRequest,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validateRequest,
  authController.resetPassword
);

router.post(
  "/change-password",
  authenticate,
  [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
  ],
  validateRequest,
  authController.changePassword
);

router.get("/current", authenticate, authController.currentUser);
router.post("/logout", authController.logout);

module.exports = router;
