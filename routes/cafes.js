const http = require("http");
const Cafe = require("../database/cafe_query");
const Mock = require("./mockData");
const get_nearby_places = require("../places/places_nearby");
const get_place_details = require("../places/places_details");
const get_place_photo = require("../places/places_photo");

module.exports = (app, connection) => {
  app.get("/mock", async (req, res, next) => {
    var { lat, lng, diff, num, sec } = req.query;
    if (lat === undefined || lng === undefined) {
      next("No location selected.");
    }
    if (isNaN(lat) || isNaN(lng)) {
      next("Location not a number.");
    }

    Mock.MockData(num, sec).then(data => res.send(data));
  });

  app.get("/search", async (req, res, next) => {
    var { lat, lng, rad } = req.query;
    if (lat === undefined || lng === undefined) {
      next("No location selected.");
    }
    if (isNaN(lat) || isNaN(lng)) {
      next("Location not a number.");
    }

    var query = {
      lat: Number(lat),
      lng: Number(lng),
      rad: Number(rad)
    };
    // 1. Get Nearby Places
    get_nearby_places(query, places => {
      if (places) {
        // For Each Place
        places.map(async place => {
          // 2. Check place ain't in MySQL
          var query = Cafe.getCafeQuery(place.place_id);
          await connection.query(query, function(error, result) {
            if (error) {
              console.log(error);
            } else {
              if (result.length > 0) {
                console.log("Cafe already saved");
              } else {
                // 3. Get Place Details
                get_place_details(place.place_id, async details => {
                  // 4. Save the Place in MySQL
                  var { place_id, name, formatted_address, geometry } = details;
                  var { lat, lng } = geometry.location;
                  var query = Cafe.saveCafeQuery(
                    place_id,
                    name,
                    lat,
                    lng,
                    formatted_address
                  );
                  await connection.query(query, async function(error, result) {
                    if (error) {
                      console.log(error);
                    } else {
                      // 5. Save the Evaluation in MySQL
                      var query = Cafe.saveEvaluationQuery(
                        place_id,
                        connection.escape(new Date())
                      );
                      await connection.query(query, async function(
                        error,
                        result
                      ) {
                        if (error) {
                          console.log(error);
                        } else {
                          // 6. Get the Evaluation ID
                          var query = Cafe.getEvaluationQuery(place_id);
                          await connection.query(query, function(
                            error,
                            result
                          ) {
                            if (error) {
                              console.log(error);
                            } else if (result.length < 1) {
                              console.log("no evaluation found");
                            } else {
                              var { evaluation_id } = result[0];
                              if (details && details.photos) {
                                // For Each Photo Reference
                                details.photos.map(photo => {
                                  // 7. Get Photo
                                  get_place_photo(
                                    photo.photo_reference,
                                    picture => {
                                      // 8. Evaluate with Python AI

                                      // 8. Evaluate with Python AI
                                      var options = {
                                        hostname: "localhost",
                                        port: 5000,
                                        path: "/",
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json"
                                        }
                                      };
                                      var req = http.request(options, function(
                                        res
                                      ) {
                                        res.setEncoding("utf8");
                                        res.on("data", async function(body) {
                                          let {
                                            marzocco_probability
                                          } = JSON.parse(body);

                                          // 9. Save Photo on MySQL
                                          var query = Cafe.saveEvaluatedPictureQuery(
                                            photo.photo_reference,
                                            evaluation_id,
                                            marzocco_probability
                                          );
                                          await connection.query(
                                            query,
                                            function(error, result) {
                                              if (error) {
                                                console.log(error);
                                              } else {
                                                console.log(
                                                  "Picture Success: " +
                                                    marzocco_probability
                                                );
                                              }
                                            }
                                          );
                                        });
                                      });
                                      req.on("error", function(e) {
                                        console.log(
                                          "problem with request: " + e.message
                                        );
                                      });
                                      req.write(JSON.stringify(picture));
                                      req.end();
                                    }
                                  );
                                });
                              }
                            }
                          });
                        }
                      });
                    }
                  });
                });
              }
            }
          });
        });
      }
    });
    res.send({ data: "Success" });
  });

  app.get("/cafes", async (req, res, next) => {
    var { lat, lng, diff } = req.query;
    if (lat === undefined || lng === undefined) {
      next("No location selected.");
    }
    if (isNaN(lat) || isNaN(lng)) {
      next("Location not a number.");
    }

    var query = Cafe.getCafesQuery(Number(lat), Number(lng), Number(diff));
    await connection.query(query, function(error, result) {
      if (error) {
        next(error);
      } else {
        res.send(result);
      }
    });
  });

  app.post("/cafes", async (req, res, next) => {
    var { google_place_id, place_name, lat, lng, address } = req.body;
    var query = Cafe.saveCafeQuery(
      google_place_id,
      place_name,
      lat,
      lng,
      address
    );

    await connection.query(query, function(error, result) {
      if (error) {
        next(error);
      } else {
        res.send(result);
      }
    });
  });
};
