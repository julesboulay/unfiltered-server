const get_place_photo = require("./places/places_photo");
const request = require("request");
const rest = require("restler");
const http = require("http");

let photo_reference =
  "CmRZAAAAcgtzDFdd-PGb1VbeqClOTBPwOsz8xW0k815XYSCb0OY21wnuZ_TqQBhdkAmu76FO1ZbSsTfyBnmBrUNzIbOWzafqYjgLdhndJ" +
  "x8e5pAdcwtzuWPIKKggg1kEu_xCIAGGEhBC4zK9uaGkppp4dO33EZPQGhQX1TrMZ72Tt-yOGiS5rbc4WaJLEw";

get_place_photo(photo_reference, async picture => {
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
  console.log(picture);
  req.write(JSON.stringify(picture));
  req.end();
});
