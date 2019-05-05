var https = require("https");
var places_key = require("../../config/google_apikeys")().places_key;

function placesNearbyQuery(lat, lng, rad, token) {
  var key = places_key;
  if (token == null || token == undefined || token == "") {
    var location = lat + "," + lng;
    var radius = rad == null || rad == undefined || rad < 0 ? 16000 : rad;
    var types = "cafe";
    return (
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${key}` +
      `&location=${location}&radius=${radius}&types=${types}`
    );
  } else {
    return (
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${key}` +
      `&pagetoken=${token}`
    );
  }
}

function placesNearby(query, callback, page_num = 1) {
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

        if (places.status != "OK") {
          console.log("Google Places error: " + places.status);
        } /* else if (page_num < 3 && locations.length == 20) {
          query.token = places.next_page_token;
          callback(locations);
          setTimeout(() => placesNearby(query, callback, page_num + 1), 2000);
        } else {*/
        callback(locations);
        //}
      });
    })
    .on("error", function(e) {
      reject("Got error: " + e.message);
    });
}

module.exports = placesNearby;
