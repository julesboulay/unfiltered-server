var https = require("https");
const download = require("image-downloader");
const fs = require("fs");
var places_key = require("../../config/google_apikeys")().places_key;

function placesPhotoQuery(photo_reference) {
  var key = places_key;
  var pixels = 300;
  var url =
    `https://maps.googleapis.com/maps/api/place/photo?key=${key}` +
    `&maxwidth=${pixels}&maxheight=${pixels}&photoreference=${photo_reference}`;
  return url;
}

function downloadPhoto(_url, _$$_, resolve, reject) {
  const options = {
    url: _url,
    dest: "./src/images/" + _$$_.photo.photo_reference + ".jpg"
  };
  download
    .image(options)
    .then(({ filename, image }) => {
      fs.readFile(options.dest, function(err, data) {
        if (err) reject(err);

        fs.unlink(options.dest, function(err) {
          if (err) reject(err);
        });

        let base64 = data.toString("base64");
        _$$_.base64 = base64;
        resolve(_$$_);
      });
    })
    .catch(err => {
      reject("Error on download: " + err);
    });
}

function placesPhoto(_$$_, resolve, reject) {
  var url = placesPhotoQuery(_$$_.photo.photo_reference);
  https
    .get(url, function(response) {
      var photoURL = "";
      response.on("data", function(chunk) {
        photoURL = response.headers.location;
      });

      response.on("end", function() {
        downloadPhoto(photoURL, _$$_, resolve, reject);
      });
    })
    .on("error", function(e) {
      reject("Got error: " + e.message);
    });
}

module.exports = placesPhoto;
