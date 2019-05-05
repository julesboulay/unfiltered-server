const Mock = require("./mockData");
const authenticated = require("./auth");
const Cafe = require("../database/query_cafe");
const ChainPlacesRequests = require("../places/chain_places");

const MAX_PLACES_API_CALLS = 50000;

module.exports = (app, connection) => {
  app.get("/mock", async (req, res, next) => {
    if (!authenticated(req)) {
      res.status(401).json({ message: "Invalid Token !" });
    } else {
      var { lat, lng, diff, num, sec } = req.query;
      if (lat === undefined || lng === undefined) {
        next("No location selected.");
      }
      if (isNaN(lat) || isNaN(lng)) {
        next("Location not a number.");
      }

      Mock.MockData(num, sec).then(data => res.send(data));
    }
  });

  app.get("/search", async (req, res, next) => {
    if (!authenticated(req)) {
      res.status(401).json({ message: "Invalid Token !" });
    } else {
      var { lat, lng, rad } = req.query;
      if (lat === undefined || lng === undefined) {
        next("No location selected.");
      }
      if (isNaN(lat) || isNaN(lng)) {
        next("Location not a number.");
      } else {
        var query = Cafe.getEvaluationsToday();
        await connection.query(query, function(error, result) {
          if (error) {
            next(error);
          } else {
            let evals = result.length;
            let num_of_api_calls_today = evals + evals + 10 * evals;
            if (num_of_api_calls_today > MAX_PLACES_API_CALLS) {
              next("Number of API calls exceeded");
            } else {
              var query = {
                lat: Number(lat),
                lng: Number(lng),
                rad: Number(rad)
              };

              ChainPlacesRequests(query, connection);
              res.send({ data: "Success" });
            }
          }
        });
      }
    }
  });

  app.get("/cafes", async (req, res, next) => {
    if (!authenticated(req)) {
      res.status(401).json({ message: "Invalid Token !" });
    } else {
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
    }
  });

  // Save the Cafe
  app.post("/cafes", async (req, res, next) => {
    if (!authenticated(req)) {
      res.status(401).json({ message: "Invalid Token !" });
    } else {
      var decoded;
      try {
        decoded = jwt.verify(req.headers["x-access-token"], config.secret);
      } catch (err) {
        decoded = { email: "username1@mail.com" };
      }
      var { email } = decoded;

      var { google_place_id, place_name, lat, lng, address } = req.body;
      var query = Cafe.saveCafeQuery(
        google_place_id,
        place_name,
        lat,
        lng,
        address
      );

      // Save the Post by user
      await connection.query(query, async function(error, result) {
        if (error) {
          next(error);
        } else {
          var query = Cafe.savePostQuery(
            google_place_id,
            email,
            connection.escape(new Date())
          );
          await connection.query(query, function(error, result) {
            if (error) {
              next(error);
            } else {
              res.send(result);
            }
          });
        }
      });
    }
  });
};
