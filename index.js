const mysql = require("mysql");
const express = require("express");
/**
 * TODO:
 * 1. Look for google search pictures
 * 2. Add ConfirmMarzcocco pipeline
 * 3. Optimize sql in-out from place-pipeline
 *
 * Pending:
 * 1. Fix Python Model
 * 2. Add [Synesso, Slayer, Van der Westen (Speedster & Kees), Rancilio, Nuevo Simoneli]
 *
 * Thoughts:
 * Store photos in Python Dir (remove *.jpg from .gitignore),
 * atleast those with high probability
 */

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

//require("./src/database/tables_drop")(connection);
//require("./src/database/tables_create")(connection);

// 3. Express App Server
const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.send({ message: "success", data: "Not DeaD YET!" });
});
require("./src/routes/cafes")(app, connection);
require("./src/routes/user")(app, connection);

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
