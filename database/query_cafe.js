module.exports = class Cafe {
  static createQuery(n, s, e, w) {
    return `
        SELECT 
            C.google_place_id, 
            C.place_name, C.lat, 
            C.lng, 
            C.address
        FROM Cafe C
        WHERE   C.lat < ${n} AND
                C.lat > ${s} AND
                C.lng < ${e} AND
                C.lng > ${w};`;
  }

  static getCafesQuery(lat, lng, diff) {
    if (diff == undefined || isNaN(diff)) diff = 5;

    var n = lat + diff,
      s = lat - diff,
      e = lng + diff * 2,
      w = lng - diff * 2;

    return this.createQuery(n, s, e, w);

    /*** EDGE CASES ***/
  }

  static getCafeQuery(placeid) {
    return `
        SELECT 
            C.google_place_id
        FROM Cafe C
        WHERE   C.google_place_id LIKE '${placeid}'`;
  }

  static saveCafeQuery(google_place_id, place_name, lat, lng, address) {
    return `
    INSERT INTO Cafe (
      google_place_id, 
      place_name, 
      lat, 
      lng, 
      address
    ) VALUES (
        '${google_place_id}', 
        "${place_name}", 
        ${lat}, 
        ${lng}, 
        "${address}"
    );`;
  }

  static saveEvaluationQuery(google_place_id, date) {
    return `
    INSERT INTO Evaluation (
      google_place_id, 
      date
    ) VALUES (
        '${google_place_id}', 
        ${date}
    );`;
  }

  static getEvaluationQuery(google_place_id) {
    return `
    SELECT E.evaluation_id 
    FROM Evaluation E
    WHERE E.google_place_id LIKE '${google_place_id}';`;
  }

  static saveEvaluatedPictureQuery(
    photo_id,
    evaluation_id,
    marzocco_likelihood
  ) {
    return `
    INSERT INTO EvaluatedPicture (
      google_picture_id, 
      evaluation_id,
      marzocco_likelihood
    ) VALUES (
        '${photo_id}', 
        '${evaluation_id}',
        ${marzocco_likelihood}
    );`;
  }

  static savePostQuery(google_place_id, email, date) {
    return `
    INSERT INTO Evaluation (
      google_place_id, 
      email,
      date
    ) VALUES (
        '${google_place_id}', 
        '${email}',
        ${date}
    );`;
  }
};
