const jwt = require("jsonwebtoken");

const authenticated = require("./auth");
const Cafe = require("../database/query_cafe");
const ChainPlacesRequests = require("../places/chain_places");
const config = require("../../config/config_test");

const MAX_PLACES_API_CALLS = 50000;

module.exports = (app, connection) => {
  app.get("/search", async (req, res, next) => {
    if (!authenticated(req)) {
      res.status(401).json({ message: "failure", error: "Invalid Token!" });
    } else {
      var { lat, lng, rad } = req.query;
      if (lat === undefined || lng === undefined) {
        res.status(400).json({ message: "failure", error: "Invalid Request!" });
      }
      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ message: "failure", error: "Invalid Request!" });
      } else {
        var query = Cafe.getEvaluationsThisMonth();
        await connection.query(query, function(error, result) {
          if (error) {
            res.status(500).json({ message: "failure", error: error.message });
          } else {
            let evals = result.length;
            let num_of_api_calls_this_month = evals + evals + 10 * evals;
            if (num_of_api_calls_this_month > MAX_PLACES_API_CALLS) {
              res.status(429).json({
                message: "failure",
                error: "Number of API calls exceeded."
              });
            } else {
              var query = {
                lat: Number(lat),
                lng: Number(lng),
                rad: Number(rad)
              };

              ChainPlacesRequests(query, connection);
              res.status(200).json({ message: "success" });
            }
          }
        });
      }
    }
  });

  app.get("/cafes", async (req, res, next) => {
    if (!authenticated(req)) {
      res.status(401).json({ message: "failure", error: "Invalid Token!" });
    } else {
      var { lat, lng, diff } = req.query;
      if (lat === undefined || lng === undefined) {
        res.status(400).json({ message: "failure", error: "Invalid Request!" });
      } else if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ message: "failure", error: "Invalid Request!" });
      } else {
        var query = Cafe.getCafesQuery(Number(lat), Number(lng), Number(diff));
        await connection.query(query, function(error, result) {
          if (error) {
            res.status(500).json({ message: "failure", error: error.message });
          } else {
            res.status(200).json({ message: "success", data: result });
          }
        });
      }
    }
  });

  app.post("/cafes", async (req, res, next) => {
    if (!authenticated(req)) {
      res.status(401).json({ message: "failure", error: "Invalid Token!" });
    } else {
      var email;
      try {
        const decoded = jwt.verify(
          req.headers["x-access-token"],
          config.secret
        );
        email = decoded.email;
      } catch (err) {}
      if (!email) {
        res.status(401).json({ message: "failure", error: "Invalid Token!" });
      } else {
        var { google_place_id, place_name, lat, lng, address } = req.body;
        var query = Cafe.saveCafeQuery(
          google_place_id,
          place_name,
          lat,
          lng,
          address
        );

        await connection.query(query, async function(error, result) {
          if (error) {
            res.status(500).json({ message: "failure", error: error.message });
          } else {
            var query = Cafe.savePostQuery(
              google_place_id,
              email,
              connection.escape(new Date())
            );
            await connection.query(query, function(error, result) {
              if (error) {
                res
                  .status(500)
                  .json({ message: "failure", error: error.message });
              } else {
                res.status(200).json({ message: "success", data: result });
              }
            });
          }
        });
      }
    }
  });
};
