function placesNearby(lat, lng, rad, token) {
  return new Promise(function(resolve, reject) {
    var key = "AIzaSyCOL-TKrDjemTBuwoNQcnpOFgMavyFErmc";
    var location = lat + "," + lng;
    var radius = rad == null || rad == undefined || rad < 0 ? 16000 : rad;
    var sensor = false;
    var types = "cafe";
    var keyword = "slow";
    var language = "";
    var pagetoken = token ? true : false;

    var https = require("https");
    var url =
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" +
      "key=" +
      key +
      "&location=" +
      location +
      "&radius=" +
      radius +
      "&sensor=" +
      sensor +
      "&types=" +
      types +
      "&keyword=" +
      keyword +
      "$language=" +
      language +
      (pagetoken ? "&pagetoken=true" : "");

    https
      .get(url, function(response) {
        var body = "";
        response.on("data", function(chunk) {
          body += chunk;
        });

        response.on("end", function() {
          var places = JSON.parse(body);
          var locations = places.results;
          var randLoc = locations[Math.floor(Math.random() * locations.length)];

          if (locations.length > 0) {
            return locations.concat(placesNearby(lat, lng, 50000, true));
          } else {
            return locations;
          }
        });
      })
      .on("error", function(e) {
        console.log("Got error: " + e.message);
      });
  });
}

var lat = 22.274,
  lng = 114.185;
placesNearby(lat, lng, 50000)
  .then(result => console.log(result))
  .catch(reason => console.log(reason));
