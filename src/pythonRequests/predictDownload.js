const mysql = require("mysql");
const request = require("request");

const Cafe = require("../database/query_cafe");
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

var _$_ = { evaluation_id: 153 };

new Promise(function(resolve, reject) {
  // #. Python Download IMGs Predictions
  request.post(
    python_options() + "/predictdownload",
    {
      json: {
        place_id: "place_id_mock_1",
        place_name: "Winston's Coffee",
        place_suffix: "Hong Kong"
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
        _$_.predictions_downloads = body.predictions;
        resolve(_$_);
      }
    }
  );
})
  .then(_$_ => {
    // For Every Downloaded Hit
    _$_.predictions_downloads.map(pred => {
      console.log(pred);
    });
  })
  .catch(err => console.log(err));
