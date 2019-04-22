const Cafe = require("../database/cafe_query");
const Mock = require("./mockData");

module.exports = (app, connection) => {
  app.get("/search", async (req, res, next) => {
    var { lat, lng, diff, num, sec } = req.query;
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
        Mock.MockData(num, sec).then(data => res.send(result.concat(data)));
      }
    });
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
    var query = `
    INSERT INTO Cafe (
      google_place_id, 
      place_name, 
      lat, 
      lng, 
      address
    ) VALUES (
        '${google_place_id}', 
        '${place_name}', 
        ${lat}, 
        ${lng}, 
        '${address}'
    );`;

    await connection.query(query, function(error, result) {
      if (error) {
        next(error);
      } else {
        res.send(result);
      }
    });
  });
};
