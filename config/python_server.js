module.exports = () => {
  var ENV = process.env.NODE_ENV || "development";
  if (ENV == "development") return "http://0.0.0.0:5000";
  return "https://unfiltered-hk-python.herokuapp.com/";
};
