var config = {
  development: {
    url: "http://my.site.com",
    database: {
      host: "remotemysql.com",
      port: "3306",
      user: "cHY7qwErSb",
      password: "RXxb2OgezA",
      db: "cHY7qwErSb"
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
      user: "cHY7qwErSb",
      password: "RXxb2OgezA",
      db: "cHY7qwErSb"
    },
    server: {
      host: "localhost",
      port: "3000"
    }
  }
};

module.exports = config;
