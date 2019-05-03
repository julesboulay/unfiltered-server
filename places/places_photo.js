var https = require("https");

function placesPhotoQuery(photo_reference) {
  var key = "AIzaSyCOL-TKrDjemTBuwoNQcnpOFgMavyFErmc";
  var pixels = 100;
  var url =
    `https://maps.googleapis.com/maps/api/place/photo?key=${key}` +
    `&maxwidth=${pixels}&maxheight=${pixels}&photoreference=${photo_reference}`;
  return url;
}

function loadPhoto(url, callback) {
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

function placesPhoto(photo_reference, callback) {
  var url = placesPhotoQuery(photo_reference);
  https
    .get(url, function(response) {
      var photoURL = "https://";
      response.on("data", function(chunk) {
        //photoURL += response.req.socket._host + response.req.path;
        photoURL = response.headers.location;
      });

      response.on("end", function() {
        loadPhoto(response.headers.location, callback);
      });
    })
    .on("error", function(e) {
      console.log("Got error: " + e.message);
    });
}

module.exports = placesPhoto;
