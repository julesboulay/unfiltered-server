module.exports = () => {
  var ENV = process.env.NODE_ENV || "development";
  if (ENV == "development") {
    var config = require("./config");
    return {
      places_key: config.google_places_api_key
    };
  } else {
    return {
      places_key: process.env.GOOGLE_PLACES_API_KEY
    };
  }
};
