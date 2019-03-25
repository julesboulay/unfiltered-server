var config = {
  development: {
    url: "http://my.site.com",
    database: {
      host: "remotemysql.com",
      port: "3306",
      user: "XolRXi53dS",
      password: "whygls9b0v",
      db: "XolRXi53dS"
    },
    server: {
      host: "localhost",
      port: "3000"
    }
  },

  production: {
    database: {
      host: "remotemysql.com",
      port: "3306",
      user: "XolRXi53dS",
      password: "whygls9b0v",
      db: "XolRXi53dS"
    },
    server: {
      host: "localhost",
      port: "3000"
    }
  }
};

module.exports = config;
