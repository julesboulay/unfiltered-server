var https = require("https");

function placesPhotoQuery(photo_reference) {
  var key = "AIzaSyCOL-TKrDjemTBuwoNQcnpOFgMavyFErmc";
  var pixels = 100;
  var url =
    `https://maps.googleapis.com/maps/api/place/details/json?key=${key}` +
    `&photo_reference=${photo_reference}&maxheight=${pixels}&maxwidth=${pixels}`;

  return url;
}

function placesPhoto(photo_reference, callback) {
  var url = placesPhotoQuery(photo_reference);
  https
    .get(url, function(response) {
      var body = [];
      response.on("data", function(chunk) {
        body = chunk;
      });

      response.on("end", function() {
        callback(body);
      });
    })
    .on("error", function(e) {
      console.log("Got error: " + e.message);
    });
}

module.exports = placesPhoto;
