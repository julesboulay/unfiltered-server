module.exports = (app, connection) => {
  app.get("/cafes", async (req, res) => {
    var query = `SELECT 
        C.google_place_id, C.place_name, C.lat, C.lng, C.address
        FROM Cafe C;`;
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
    var query = `INSERT INTO Cafe (google_place_id, place_name, lat, lng, address)
    VALUES ('${google_place_id}', '${place_name}', ${lat}, ${lng}, '${address}');
    `;

    await connection.query(query, function(error, result) {
      if (error) {
        res.send(error);
      } else {
        res.send(result);
      }
    });
  });
};
