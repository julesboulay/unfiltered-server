const mysql = require("mysql");

var config = (config = require("./config/config_test")["production"]);

var connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  port: config.database.port,
  password: config.database.password,
  database: config.database.db
});
connection.connect();

let query = `
    SELECT *
    FROM Cafe;`;
//query = "DELETE FROM Cafe;";
connection.query(query, function(error, result) {
  if (error) throw error;
  console.log(result);
});
