var https = require("https");

function placesDetailsQuery(placeid) {
  var key = "AIzaSyCOL-TKrDjemTBuwoNQcnpOFgMavyFErmc";
  var language = "english";
  var url =
    `https://maps.googleapis.com/maps/api/place/details/json?key=${key}` +
    `&placeid=${placeid}&language=${language}`;

  return url;
}

function placesDetails(placeid, callback) {
  var url = placesDetailsQuery(placeid);
  https
    .get(url, function(response) {
      var body = "";
      response.on("data", function(chunk) {
        body += chunk;
      });

      response.on("end", function() {
        var place = JSON.parse(body);
        callback(place.result);
      });
    })
    .on("error", function(e) {
      console.log("Got error: " + e.message);
    });
}

module.exports = placesDetails;
