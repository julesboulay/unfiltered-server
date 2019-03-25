const mysql = require("mysql");
const express = require("express");

// 1. Config
var env = process.env.NODE_ENV || "development";
var config = require("./config/config_test")[env];

// 1. MySQL Database
var connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.db
});
connection.connect();

var query = "SHOW Tables;";
connection.query(query, function(error, results, fields) {
  if (error) throw error;
  console.log(results);
});
connection.end();

// 2. Express App Server
const app = express();
app.get("/", (req, res) => {
  console.log("Request recieved");
  res.send({ hello: "world" });
});
app.listen(config.server.port, () =>
  console.log(`Example app listening on port ${config.server.port}!`)
);
