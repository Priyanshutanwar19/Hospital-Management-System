const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");
const apiResponse = require("../utils/apiResponse");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json(apiResponse({ success: false, message: "Authentication token missing" }));
    }

    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json(apiResponse({ success: false, message: "Invalid authentication token" }));
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(apiResponse({ success: false, message: "Authentication failed" }));
  }
};

module.exports = authenticate;
