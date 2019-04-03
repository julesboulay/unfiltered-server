const Cafe = require("../database/cafe_query");

module.exports = (app, connection) => {
  app.get("/cafes", async (req, res) => {
    var { lat, lng, diff } = req.query;
    if (lat === undefined || lng === undefined) {
      res.error("No location selected.");
      return;
    }
    if (isNaN(lat) || isNaN(lng)) {
      res.error("Location not a number.");
      return;
    }

    var query = Cafe.getCafesQuery(Number(lat), Number(lng), Number(diff));
    await connection.query(query, function(error, result) {
      if (error) {
        res.error(error);
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
        res.error(error);
      } else {
        res.send(result);
      }
    });
  });
};
