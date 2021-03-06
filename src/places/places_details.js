var https = require("https");
var places_key = require("../../config/google_apikeys")().places_key;

function placesDetailsQuery(placeid) {
  var key = places_key;
  var language = "english";
  var url =
    `https://maps.googleapis.com/maps/api/place/details/json?key=${key}` +
    `&placeid=${placeid}&language=${language}`;

  return url;
}

function placesDetails(_$_, resolve, reject) {
  var placeid = _$_.place.place_id;
  var url = placesDetailsQuery(placeid);
  https
    .get(url, function(response) {
      var body = "";
      response.on("data", function(chunk) {
        body += chunk;
      });

      response.on("end", function() {
        var place = JSON.parse(body);
        _$_.details = place.result;
        resolve(_$_);
      });
    })
    .on("error", function(e) {
      reject("Got error: " + e.message);
    });
}

module.exports = placesDetails;
