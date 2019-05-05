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

var query = "SELECT google_picture_id FROM EvaluatedPicture LIMIT 4;";
connection.query(query, function(error, result) {
  if (error) {
    console.log(error);
  } else {
    // For Each Photo Reference
    result.map(photo => {
      new Promise(function(resolve, reject) {
        // 8. Get Photo from Google
        let _$$_ = {
          photo: { photo_reference: photo.google_picture_id }
        };
        get_place_photo(_$$_, resolve, reject);
      })
        .then(_$$_ => {
          return new Promise(function(resolve, reject) {
            // 9. Evaluate with Python AI
            request.post(
              python_options(),
              {
                json: {
                  type: "Buffer",
                  photo_id: _$$_.photo.photo_reference,
                  data: _$$_.base64
                }
              },
              function(error, res, body) {
                if (error) {
                  reject(error);
                } else if (!body.message) {
                  reject("Heroku Internal Error");
                } else if (body.message != "success") {
                  reject(body.error);
                } else {
                  const { marzocco_probability } = body;
                  _$$_.marzocco_probability = marzocco_probability;
                  resolve(_$$_);
                }
              }
            );
          });
        })
        .then(_$$_ => {
          console.log("Success");
        })
        .catch(err => console.log(err));
    });
  }
});
