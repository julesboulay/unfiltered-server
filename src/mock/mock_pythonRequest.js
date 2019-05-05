const mysql = require("mysql");
const request = require("request");

const get_place_photo = require("../places/places_photo");

const python_options = require("../../config/python_server");
const config = require("../../config/config")["development"];

var connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  port: config.database.port,
  password: config.database.password,
  database: config.database.db
});
connection.connect();

var query = "SELECT google_picture_id FROM EvaluatedPicture LIMIT 2;";
connection.query(query, function(error, result) {
  if (error) {
    console.log(error);
  } else {
    // For each Picture
    result.map(res => {
      get_place_photo(res.google_picture_id, base64 => {
        // Evaluate with Python AI
        request.post(
          python_options(),
          {
            json: {
              type: "Buffer",
              data: base64
            }
          },
          function(error, response, body) {
            if (error) {
              console.log(error);
            } else {
              const { marzocco_probability } = body;
              console.log(marzocco_probability);
            }
          }
        );
      });
    });
  }
});
