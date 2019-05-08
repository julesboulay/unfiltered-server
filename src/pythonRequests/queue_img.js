const request = require("request");
const python_options = require("../../config/python_server");
const Queue = require("../database/query_queue");
const Cafe = require("../database/query_cafe");
const get_place_photo = require("../places/places_photo");

module.exports = class ImageRequestsQueue {
  constructor(connection) {
    this.con = connection;
  }

  requestImgPrediction(_$_) {
    let { con } = this;
    return new Promise(function(resolve, reject) {
      // 1. Fetch QueueItems
      var query = Queue.getImgQueueItems();
      con.query(query, function(error, result) {
        if (error) {
          reject(error.message);
        } else {
          resolve(result);
        }
      });
    })
      .then(queue_items => {
        if (queue_items.length < 1) {
          _$_.img_queue_was_empty = true;
        } else {
          _$_.waiting_for_response = true;
          _$_.current_request =
            "Image Requests With evaluation_id = " +
            queue_items[0].evaluation_id;
          console.log("Sending Python Image Requests");

          // 2. Retrieve Photos From Google
          queue_items.map(({ evaluation_id, photo_reference }) => {
            let _$$_ = { evaluation_id, photo: { photo_reference } };
            new Promise(function(resolve, reject) {
              get_place_photo(_$$_, resolve, reject);
            })
              .then(_$$_ => {
                return new Promise(function(resolve, reject) {
                  // 3. Evaluate with Python AI
                  request.post(
                    python_options() + "/predictimage",
                    {
                      json: {
                        type: "Buffer",
                        photo_id: _$$_.photo.photo_reference,
                        data: _$$_.base64
                      }
                    },
                    function(error, res, body) {
                      if (error) {
                        reject(error);
                      } else if (!body.message) {
                        reject("Heroku Internal Error");
                      } else if (body.message != "success") {
                        reject(body.error);
                      } else {
                        const { marzocco_probability } = body;
                        _$$_.marzocco_probability = marzocco_probability;
                        resolve(_$$_);
                      }
                    }
                  );
                });
              })
              .then(_$$_ => {
                return new Promise(function(resolve, reject) {
                  // 4. Save Photo on MySQL
                  var query = Cafe.saveEvaluatedPictureQuery(
                    _$$_.photo.photo_reference,
                    _$$_.evaluation_id,
                    _$$_.marzocco_probability
                  );
                  con.query(query, function(error, result) {
                    if (error) {
                      reject(error.message);
                    } else {
                      console.log({
                        message: "success",
                        marzocco_probability: _$$_.marzocco_probability
                      });
                      resolve(_$$_.evaluation_id);
                    }
                  });
                }).then(evaluation_id => {
                  // 6. Delete QueueItem from MySQL
                  var query = Queue.deleteImgQueueItem(evaluation_id);
                  con.query(query, function(error, result) {
                    if (error) {
                      _$_.error_found = error.message;
                    }
                  });
                  _$_.waiting_for_response = false;
                });
              })
              .catch(err => (_$_.error_found = err));
          });
        }
      })
      .catch(err => (_$_.error_found = err));
  }
};
