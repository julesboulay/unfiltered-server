const request = require("request");

const get_nearby_places = require("./places_nearby");
const get_place_details = require("./places_details");
const get_place_photo = require("./places_photo");
const filter_places = require("./places_filter");

const Cafe = require("../database/query_cafe");
const python_options = require("../../config/python_server");

/**
 * 1. Look for google search pictures
 * 2. Look for marzocco in reviews
 */

module.exports = function ChainPlacesRequest(query, connection) {
  // 1. Get Nearby Places
  get_nearby_places(query, places => {
    new Promise(function(resolve, reject) {
      // 2. Filter Places
      if (!places) reject("No Places recieved");
      places = filter_places(places);
      resolve(places);
    })
      .then(places => {
        // 2. Filter Places
        if (!places) throw "No Places recieved";
        places = filter_places(places);
        return places;
      })
      .then(places => {
        // For Each Place
        places.map(place => {
          new Promise(function(resolve, reject) {
            // 3. Check place ain't in MySQL
            var query = Cafe.getCafeQuery(place.place_id);
            connection.query(query, function(error, result) {
              if (error) {
                reject(error);
              } else if (result.length > 0) {
                reject("Cafe already saved");
              } else {
                resolve(place);
              }
            });
          })
            .then(place => {
              // 4. Get Place Details
              return new Promise(function(resolve, reject) {
                get_place_details(place.place_id, resolve, reject);
              });
            })
            .then(details => {
              return new Promise(function(resolve, reject) {
                // 5. Save the Place in MySQL
                var { place_id, name, formatted_address, geometry } = details;
                var { lat, lng } = geometry.location;
                var query = Cafe.saveCafeQuery(
                  place_id,
                  name,
                  lat,
                  lng,
                  formatted_address
                );
                connection.query(query, function(error, result) {
                  if (error) {
                    reject(error);
                  } else if (!details.photos) {
                    reject("No Pictures To Evaluate");
                  } else if (details.photos.length == 0) {
                    reject("No Pictures To Evaluate");
                  } else {
                    resolve({ place: place, details: details });
                  }
                });
              });
            })
            .then(_$_ => {
              return new Promise(function(resolve, reject) {
                // 6. Save the Evaluation in MySQL
                var query = Cafe.saveEvaluationQuery(
                  _$_.place.place_id,
                  connection.escape(new Date())
                );
                connection.query(query, function(error, result) {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(_$_);
                  }
                });
              });
            })
            .then(_$_ => {
              return new Promise(function(resolve, reject) {
                // 7. Get the Evaluation ID
                var query = Cafe.getEvaluationQuery(_$_.place.place_id);
                connection.query(query, function(error, result) {
                  if (error) {
                    reject(error);
                  } else if (result.length < 1) {
                    reject("no evaluation found");
                  } else {
                    _$_.evaluation_id = result[0].evaluation_id;
                    resolve(_$_);
                  }
                });
              });
            })
            .then(_$_ => {
              // For Each Photo Reference
              _$_.details.photos.map(photo => {
                new Promise(function(resolve, reject) {
                  // 8. Get Photo from Google
                  let _$$_ = {
                    place: _$_.place,
                    details: _$_.details,
                    photo: photo,
                    evaluation_id: _$_.evaluation_id
                  };
                  get_place_photo(_$$_, resolve, reject);
                })
                  .then(_$$_ => {
                    return new Promise(function(resolve, reject) {
                      // 9. Evaluate with Python AI
                      request.post(
                        python_options(),
                        {
                          json: {
                            type: "Buffer",
                            photo_id: _$$_.photo.photo_reference,
                            data: _$$_.base64
                          }
                        },
                        function(error, res, body) {
                          if (error) {
                            reject(error);
                          } else if (body.message != "success" || body.error) {
                            reject(body.error);
                          } else {
                            const { marzocco_probability } = body;
                            _$$_.marzocco_probability = marzocco_probability;
                            resolve(_$$_);
                          }
                        }
                      );
                    });
                  })
                  .then(_$$_ => {
                    return new Promise(function(resolve, reject) {
                      // 10. Save Photo on MySQL
                      var query = Cafe.saveEvaluatedPictureQuery(
                        _$$_.photo.photo_reference,
                        _$$_.evaluation_id,
                        _$$_.marzocco_probability
                      );
                      connection.query(query, function(error, result) {
                        if (error) {
                          reject(error);
                        } else {
                          console.log(
                            "Picture Success: " + _$$_.marzocco_probability
                          );
                        }
                      });
                    });
                  })
                  .catch(err => console.log(err));
              });
            })
            .catch(err => console.log(err));
        });
      });
  });
};
