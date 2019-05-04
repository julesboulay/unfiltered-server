const mysql = require("mysql");
const express = require("express");

// 1. Config
var ENV = process.env.NODE_ENV || "development";
var PORT = process.env.PORT || 3000;
var config = require("./config/config_test")["production"];
if (ENV == "development") config = require("./config/config")["development"];

// 2. MySQL Database
var connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  port: config.database.port,
  password: config.database.password,
  database: config.database.db
});
connection.connect();

// #. Clean Database
//require("./database/tables_drop")(connection);
//require("./database/tables_create")(connection);

// #. Mock Python Photo Request
//require("./mock_python_request")(connection);

// 3. Express App Server
const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.send({ Not: "Dead YET" });
});
require("./routes/cafes")(app, connection);
require("./routes/user")(app, connection);

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
