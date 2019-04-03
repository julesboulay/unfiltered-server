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

  static getCafesQuery(lat, lng) {
    const diff = 2;
    var n = lat + diff,
      s = lat - diff,
      e = lng + diff * 2,
      w = lng - diff * 2;

    return this.createQuery(n, s, e, w);

    /*** EDGE CASES ***/
    /*if (n > 90) {
      var newN = s;
      s = -(n % 90);
      n = newN;
      if (e > 180) {
        var newE = w;
        w = -(e % 180);
        e = newE;
        return this.createQuery(n, s, e, w);
      } else return this.createQuery(n, s, e, w);
    } else if (s < -90) {
      var newS = n;
      n = -(s % 90);
      s = newS;
      if (e > 180) {
        var newE = w;
        w = -(e % 180);
        e = newE;
        return this.createQuery(n, s, e, w);
      } else return this.createQuery(n, s, e, w);
    } else {
      return this.createQuery(n, s, e, w);
    }*/
  }
};
