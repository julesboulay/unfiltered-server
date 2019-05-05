module.exports = function FilterPlaces(places) {
  return places.filter(p => {
    if (p.name.includes("Starbucks")) {
      return false;
    } else if (p.name.includes("Pacific")) {
      return false;
    } else if (p.user_ratings_total < 50) {
      return false;
    } else if (p.rating < 4.0) {
      return false;
    } else {
      return true;
    }
  });
};
