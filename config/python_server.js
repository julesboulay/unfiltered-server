module.exports = () => {
  var ENV = process.env.NODE_ENV || "development";
  if (ENV == "development")
    return {
      hostname: "localhost",
      port: 5000,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    };
  else
    return {
      hostname: "https://unfiltered-hk-python.herokuapp.com",
      path: "/",
      port: 443,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    };
};
