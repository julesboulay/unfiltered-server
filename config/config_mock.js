var config = {
  development: {
    url: "http://my.site.com",
    database: {
      host: "localhost",
      user: "root",
      password: "password",
      db: "db_name"
    },
    server: {
      host: "localhost",
      port: "3000"
    }
  },

  production: {
    url: ""
  }
};

module.exports = config;
