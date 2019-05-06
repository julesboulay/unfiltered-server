const mysql = require("mysql");

var config = (config = require("../../config/config_test")["production"]);
//var config = (config = require("../../config/config")["development"]);

var connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  port: config.database.port,
  password: config.database.password,
  database: config.database.db
});
connection.connect();

let query1 = `
    SELECT C.place_name, E.evaluation_id
    FROM Cafe C, Evaluation E
    WHERE C.google_place_id LIKE E.google_place_id;`,
  query2 = `
    SELECT COUNT(P.google_picture_id)
    FROM EvaluatedPicture P
    GROUP BY P.evaluation_id`,
  query3 = `
    SELECT 
      C.google_place_id, 
      C.place_name, C.lat, 
      C.lng, 
      C.address,
      MAX(P.marzocco_likelihood)
    FROM Cafe C, Evaluation E, EvaluatedPicture P
    WHERE 
      C.google_place_id LIKE E.google_place_id AND
      E.evaluation_id = P.evaluation_id
    GROUP BY C.google_place_id
    HAVING MAX(P.marzocco_likelihood) > .0
    ORDER BY C.google_place_id DESC`,
  query4 = `
    SELECT evaluation_id, DATE_FORMAT(date, '%Y-%m-%d') 
    FROM Evaluation 
    WHERE DATE(date) = CURDATE()
`;

if (false) {
  connection.query(query1, function(error, result) {
    if (error) console.log(error);
    console.log(result);
  });
} else {
  var tables = ["Post", "EvaluatedPicture", "Evaluation", "Cafe"];
  tables.map(t => {
    connection.query(`DELETE FROM ${t};`, function(error, result) {
      if (error) console.log(error);
      console.log(result);
    });
  });
}
