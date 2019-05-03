const mysql = require("mysql");
const express = require("express");

// 1. Config
//var ENV = process.env.NODE_ENV || "development";
var PORT = process.env.PORT || 3000;
//var config = require("./config/config_test")["development"];
var config = require("./config/config")["development"];

// 2. MySQL Database
var connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  port: config.database.port,
  password: config.database.password,
  database: config.database.db
});
connection.connect();
//connection.end();

// #. Mock Python Photo Request
//const mock_request = require("./mock_python_request");
//mock_request(connection);

// 3. Express App Server
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  console.log("Request recieved");
  res.send({ hello: "world" });
});
require("./routes/cafes")(app, connection);

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
