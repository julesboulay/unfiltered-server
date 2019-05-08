const get_nearby_places = require("./places_nearby");
const get_place_details = require("./places_details");
const filter_places = require("./places_filter");

const Cafe = require("../database/query_cafe");
const Queue = require("../database/query_queue");

const hit_words = [
  "Marzocco",
  "fb80",
  "gb5",
  "kb90",
  "leva",
  "linea",
  "strada"
];

module.exports = function ChainPlacesRequest(query, connection) {
  // 1. Get Nearby Places
  new Promise(function(resolve, reject) {
    get_nearby_places({ query, resolve }, (locations, error) => {
      new Promise(function(resolve, reject) {
        // 2. Filter Places
        if (error) reject(error);
        if (!locations) reject("No Places recieved");
        locations = filter_places(locations);
        resolve(locations);
      })
        .then(locations => {
          // For Each Place
          locations.map(place => {
            new Promise(function(resolve, reject) {
              // 3. Check place ain't in MySQL
              var query = Cafe.getCafeQuery(place.place_id);
              connection.query(query, function(error, result) {
                if (error) {
                  reject(error.message);
                } else if (result.length > 0) {
                  reject("Cafe already saved");
                } else {
                  resolve(place);
                }
              });
            })
              .then(place => {
                // 4. Get Place Details
                let _$_ = {
                  place: place,
                  details: undefined,
                  evaluation_id: undefined
                };
                return new Promise(function(resolve, reject) {
                  get_place_details(_$_, resolve, reject);
                });
              })
              .then(_$_ => {
                return new Promise(function(resolve, reject) {
                  // 5. Save the Place in MySQL
                  var query = Cafe.saveCafeQuery(
                    _$_.details.place_id,
                    _$_.details.name,
                    _$_.details.geometry.location.lat,
                    _$_.details.geometry.location.lng,
                    _$_.details.formatted_address
                  );
                  connection.query(query, function(error, result) {
                    if (error) {
                      reject(error.message);
                    } else {
                      if (!_$_.details.photos) _$_.details.photos = [];
                      if (!_$_.details.reviews) _$_.details.reviews = [];
                      resolve(_$_);
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
                      reject(error.message);
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
                      reject(error.message);
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
                // ##############################################################
                // 8. Check if Reviews contain Hit Words
                _$_.details.reviews.map(({ text }) => {
                  hit_words.map(hit_word => {
                    let hit = false;
                    if (text.includes(hit_word)) hit = true;
                    else if (text.includes(hit_word.toUpperCase())) hit = true;
                    else if (text.includes(hit_word.toLowerCase())) hit = true;
                    if (hit) {
                      // 9. Save hit words to MySQL
                      let query = Cafe.saveReviewHit(
                        _$_.evaluation_id,
                        hit_word,
                        text
                      );
                      connection.query(query, function(error, result) {
                        if (error) {
                          console.log(error.message);
                        } else {
                          console.log({
                            message: "success",
                            name: _$_.details.name,
                            hit_word: hit_word
                          });
                        }
                      });
                    }
                  });
                });

                // ##############################################################
                // Add each Photo to Python Image Request Queue
                _$_.details.photos.map(photo => {
                  new Promise(function(resolve, reject) {
                    // 12. Enqueue Python Request to MySQL
                    var query = Queue.saveImgQueueItem(
                      _$_.evaluation_id,
                      photo.photo_reference,
                      connection.escape(new Date())
                    );
                    connection.query(query, function(error, result) {
                      if (error) {
                        console.log(error.message);
                      } else {
                        console.log("Added Python Image Request to Queue");
                      }
                    });
                  });
                });

                // ##############################################################
                // Add each Place to Python Download Request Queue
                new Promise(function(resolve, reject) {
                  // 13. Find Google Search KeyWords Suffix
                  _$_.suffix = "";
                  if (_$_.details.address_components)
                    _$_.details.address_components.map(
                      ({ types, short_name }) => {
                        if (types)
                          types.map(t => {
                            if (t == "administrative_area_level_1")
                              _$_.suffix += short_name + ", ";
                            else if (t == "administrative_area_level_2")
                              _$_.suffix += short_name + ", ";
                            else if (t == "locality")
                              _$_.suffix += short_name + ", ";
                            else if (t == "neighborhood")
                              _$_.suffix += short_name + ", ";
                          });
                      }
                    );
                  resolve(_$_);
                })
                  .then(_$_ => {
                    // 14. Enqueue Python Request to MySQL
                    var query = Queue.saveDwlQueueItem(
                      _$_.evaluation_id,
                      _$_.details.place_id,
                      _$_.details.name,
                      _$_.suffix,
                      connection.escape(new Date())
                    );
                    connection.query(query, function(error, result) {
                      if (error) {
                        console.log(error.message);
                      } else {
                        console.log("Added Python Download Request to Queue");
                      }
                    });
                  })
                  .catch(err => console.log(err));
              })
              .catch(err => console.log(err));
          });
        })
        .catch(err => console.log(err));
    });
  });
};
