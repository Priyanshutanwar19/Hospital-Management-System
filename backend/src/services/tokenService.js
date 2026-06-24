const { signToken, verifyToken } = require("../utils/jwt");

const createAccessToken = (user) => {
  return signToken({ id: user._id, role: user.role }, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN || "15m");
};

const createRefreshToken = (user) => {
  return signToken({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, process.env.REFRESH_TOKEN_EXPIRES_IN || "7d");
};

const verifyRefreshToken = (token) => {
  return verifyToken(token, process.env.REFRESH_TOKEN_SECRET);
};

module.exports = { createAccessToken, createRefreshToken, verifyRefreshToken };
