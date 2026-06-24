const apiResponse = require("../utils/apiResponse");

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(apiResponse({ success: false, message: "Unauthorized" }));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(apiResponse({ success: false, message: "Forbidden" }));
    }

    next();
  };
};

module.exports = authorize;
