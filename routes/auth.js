const jwt = require("jsonwebtoken");
const config = require("../config/config");

module.exports = function checkToken(req) {
  const token = req.headers["x-access-token"];

  if (token) {
    try {
      var decoded = jwt.verify(token, config.secret);
      return decoded.message === req.params.id;
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
};
