var https = require("https");

function placesNearbyQuery(lat, lng, rad, token) {
  var key = "AIzaSyCOL-TKrDjemTBuwoNQcnpOFgMavyFErmc";
  var location = lat + "," + lng;
  var radius = rad == null || rad == undefined || rad < 0 ? 16000 : rad;
  var sensor = false;
  var types = "cafe";
  var keyword = "slow";
  var language = "english";
  var pagetoken = token ? "&pagetoken=true" : "";

  var url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${key}` +
    `&location=${location}&radius=${radius}&sensor=${sensor}&types=${types}` +
    `&keyword=${keyword}&language=${language}${pagetoken}`;

  return url;
}

function placesNearby(query, callback, pre_locations = []) {
  var url = placesNearbyQuery(query.lat, query.lng, query.rad, query.token);
  https
    .get(url, function(response) {
      var body = "";
      response.on("data", function(chunk) {
        body += chunk;
      });

      response.on("end", function() {
        var places = JSON.parse(body);
        var locations = places.results;

        if (locations.length > 0) {
          query.token = true;
          callback(
            placesNearby(query, callback, pre_locations.concat(locations))
          );
        } else {
          callback(pre_locations.concat(locations));
        }
      });
    })
    .on("error", function(e) {
      console.log("Got error: " + e.message);
    });
}

module.exports = placesNearby;
