const get_place_photo = require("./places/places_photo");
const http = require("http");
const fs = require("fs");

module.exports = async function loadImage(connection) {
  var query = "SELECT google_picture_id FROM EvaluatedPicture LIMIT 1;";
  await connection.query(query, function(error, result) {
    if (error) {
      console.log(error);
    } else {
      // For each Picture
      result.map(res => {
        get_place_photo(res.google_picture_id, picture => {
          // Save Picture
          fs.writeFile(
            `./images/${res.google_picture_id}.png`,
            picture,
            function(err) {
              if (err) throw err;
              console.log("It's saved!");

              // 8. Evaluate with Python AI
              var options = {
                hostname: "localhost",
                port: 5000,
                path: "/",
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                }
              };
              var req = http.request(options, function(res) {
                res.setEncoding("utf8");
                res.on("data", function(body) {
                  let { marzocco_probability } = JSON.parse(body);
                  console.log(marzocco_probability);
                });
              });
              req.on("error", function(e) {
                console.log("problem with request: " + e.message);
              });
              req.write(JSON.stringify(picture));
              req.end();
            }
          );
        });
      });
    }
  });
};
