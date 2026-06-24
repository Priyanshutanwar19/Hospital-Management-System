const { validationResult } = require("express-validator");
const apiResponse = require("../utils/apiResponse");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(
      apiResponse({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    );
  }
  next();
};

module.exports = validateRequest;
