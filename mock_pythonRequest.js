const http = require("http");
const fs = require("fs");
const mysql = require("mysql");
const get_place_photo = require("./places/places_photo");

const python_options = require("./config/python_server");
const config = require("./config/config")["development"];

var connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  port: config.database.port,
  password: config.database.password,
  database: config.database.db
});
connection.connect();

var query = "SELECT google_picture_id FROM EvaluatedPicture LIMIT 1;";
connection.query(query, function(error, result) {
  if (error) {
    console.log(error);
  } else {
    // For each Picture
    result.map(res => {
      get_place_photo(res.google_picture_id, picture => {
        // 1. Save Picture
        fs.writeFile(`./images/${res.google_picture_id}.png`, picture, function(
          err
        ) {
          if (err) throw err;
          console.log("It's saved!");
          //console.log(picture.toString("hex"));
        });

        // 2. Evaluate with Python AI
        var options = python_options();
        var req = http.request(options, function(res) {
          res.setEncoding("utf8");
          let body = "";
          res.on("data", function(chunk) {
            body += chunk;
          });
          res.on("end", function() {
            let { marzocco_probability } = JSON.parse(body);
            console.log(marzocco_probability);
          });
        });
        req.on("error", function(e) {
          console.log("problem with request: " + e.message);
        });
        req.write(JSON.stringify(picture));
        req.end();
      });
    });
  }
});
