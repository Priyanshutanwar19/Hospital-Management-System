const apiResponse = ({ success, message, data = null, errors = null, meta = null }) => ({
  success,
  message,
  data,
  errors,
  meta,
});

module.exports = apiResponse;
