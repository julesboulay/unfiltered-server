const Cafe = require("../database/cafe_query");

module.exports = (app, connection) => {
  app.get("/cafes", async (req, res) => {
    var { lat, lng } = req.query;
    if (lat === undefined || lng === undefined) {
      res.send("No location selected.");
      return;
    }
    if (isNaN(lat) || isNaN(lng)) {
      res.send("Location not a number.");
      return;
    }

    var query = Cafe.getCafesQuery(lat, lng);
    await connection.query(query, function(error, result) {
      if (error) {
        res.send(error);
      } else {
        res.send(result);
      }
    });
  });

  app.post("/cafes", async (req, res) => {
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
        res.send(error);
      } else {
        res.send(result);
      }
    });
  });
};
