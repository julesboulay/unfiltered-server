// Use line below from index.js to create tables.
// require("./database/tables_create")(connection);

module.exports = connection => {
  var tables = [
    {
      name: 'Cafe',
      sql: `
      CREATE TABLE Cafe (
        google_place_id VARCHAR(255) NOT NULL,
        place_name VARCHAR(255) NOT NULL,
        lat DOUBLE NOT NULL,
        lng DOUBLE NOT NULL,
        address TEXT NOT NULL,

        PRIMARY KEY(google_place_id)
      ) ENGINE = INNODB;`
    },
    {
      name: 'Evaluation',
      sql: `
      CREATE TABLE Evaluation (
        evaluation_id INT(12) NOT NULL AUTO_INCREMENT,
        google_place_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,

        PRIMARY KEY(evaluation_id),
        FOREIGN KEY(google_place_id) REFERENCES Cafe(google_place_id)
      ) ENGINE = INNODB AUTO_INCREMENT=1;`
    },
    {
      name: 'EvaluatedPicture',
      sql: `
      CREATE TABLE EvaluatedPicture (
        google_picture_id VARCHAR(255) NOT NULL,
        evaluation_id INT(12) NOT NULL,
        marzocco_likelihood DOUBLE NOT NULL,

        PRIMARY KEY(google_picture_id),
        FOREIGN KEY(evaluation_id) REFERENCES Evaluation(evaluation_id)
      ) ENGINE = INNODB;`
    },
    {
      name: 'DwlQueueItem',
      sql: `
      CREATE TABLE DwlQueueItem(
        evaluation_id INT(12) NOT NULL,
        place_id VARCHAR(255) NOT NULL,
        place_name VARCHAR(255) NOT NULL,
        place_suffix VARCHAR(255) NOT NULL,
        date DATE NOT NULL,

        PRIMARY KEY(evaluation_id),
        FOREIGN KEY(evaluation_id) REFERENCES Evaluation(evaluation_id)
      ) ENGINE = INNODB;`
    },
    {
      name: 'ImgQueueItem',
      sql: `
      CREATE TABLE ImgQueueItem(
        evaluation_id INT(12) NOT NULL,
        photo_reference VARCHAR(255) NOT NULL,
        date DATE NOT NULL,

        PRIMARY KEY(photo_reference),
        FOREIGN KEY(evaluation_id) REFERENCES Evaluation(evaluation_id)
      ) ENGINE = INNODB;`
    },
    {
      name: 'ReviewHit',
      sql: `
      CREATE TABLE ReviewHit (
        reviewhit_id INT(12) NOT NULL AUTO_INCREMENT,
        evaluation_id INT(12) NOT NULL,
        hit_word VARCHAR(255) NOT NULL,
        review TINYTEXT NOT NULL,

        PRIMARY KEY(reviewhit_id),
        FOREIGN KEY(evaluation_id) REFERENCES Evaluation(evaluation_id)
      ) ENGINE = INNODB AUTO_INCREMENT=1;`
    },
    {
      name: 'User',
      sql: `
      CREATE TABLE User (
        email VARCHAR(255) NOT NULL,
        username VARCHAR(20) NOT NULL,
        password VARCHAR(100) NOT NULL,
        sign_up_date DATE NOT NULL,

        PRIMARY KEY(email)
      ) ENGINE = INNODB AUTO_INCREMENT=1;`
    },
    {
      name: 'ConfirmMarzocco',
      sql: `
      CREATE TABLE ConfirmMarzocco(
        google_place_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        date DATE NOT NULL,

        PRIMARY KEY(google_place_id, email),
        FOREIGN KEY(google_place_id) REFERENCES Cafe (google_place_id),
        FOREIGN KEY(email) REFERENCES User (email)
      ) ENGINE = INNODB AUTO_INCREMENT=1;`
    },
    {
      name: 'Post',
      sql: `
      CREATE TABLE Post (
        google_place_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        date DATE NOT NULL,

        PRIMARY KEY(google_place_id),
        FOREIGN KEY(google_place_id) REFERENCES Cafe(google_place_id),
        FOREIGN KEY(email) REFERENCES User(email)
      ) ENGINE = INNODB AUTO_INCREMENT=1;`
    }
  ];

  tables.map(table => {
    connection.query(table.sql, function(error, result) {
      if (error) throw error;
      console.log('Table ' + table.name + ' Created');
    });
  });
};
