module.exports = class Queue {
  static saveDwlQueueItem(evaluation_id, id, name, suff, date) {
    return `
      INSERT INTO DwlQueueItem (
        evaluation_id,
        place_id,
        place_name,
        place_suffix,
        date
      ) VALUES (
          ${evaluation_id},
          '${id}',
          "${name}",
          "${suff}",
          ${date}
      );`;
  }

  static saveImgQueueItem(evaluation_id, photo_reference, date) {
    return `
      INSERT INTO ImgQueueItem (
        evaluation_id,
        photo_reference,
        date
      ) VALUES (
          ${evaluation_id},
          '${photo_reference}',
          ${date}
      );`;
  }

  static getDwlQueueItems() {
    return `
      SELECT 
        evaluation_id,
        place_id,
        place_name,
        place_suffix
      FROM DwlQueueItem 
      ORDER BY date;`;
  }

  static getImgQueueItems() {
    return `
      SELECT 
        evaluation_id,
        photo_reference
      FROM ImgQueueItem 
        WHERE evaluation_id IN (
          SELECT MIN(evaluation_id) 
          FROM ImgQueueItem
        )
      ORDER BY date;`;
  }

  static deleteDwlQueueItem(evaluation_id) {
    return `
      DELETE FROM DwlQueueItem WHERE evaluation_id = ${evaluation_id};`;
  }

  static deleteImgQueueItem(evaluation_id) {
    return `
      DELETE FROM ImgQueueItem WHERE evaluation_id = ${evaluation_id};`;
  }
};
