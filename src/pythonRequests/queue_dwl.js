const request = require("request");
const python_options = require("../../config/python_server");
const Queue = require("../database/query_Queue");
const Cafe = require("../database/query_cafe");

module.exports = class DownloadRequestsQueue {
  constructor(connection) {
    this.con = connection;
  }

  requestDwlPrediction(_$_) {
    let { con } = this;
    return new Promise(function(resolve, reject) {
      // 1. Fetch QueueItems
      var query = Queue.getDwlQueueItems();
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
          _$_.dwl_queue_was_empty = true;
        } else {
          _$_.waiting_for_response = true;
          _$_.current_request =
            "Download Request With evaluation_id = " +
            queue_items[0].evaluation_id;
          console.log("Sending Python Download Request");

          let {
            evaluation_id,
            place_id,
            place_name,
            place_suffix
          } = queue_items[0];
          let _$$_ = { evaluation_id, place_name };

          new Promise(function(resolve, reject) {
            // 2. Python Download IMGs Predictions
            request.post(
              python_options() + "/predictdownload",
              {
                json: { place_id, place_name, place_suffix }
              },
              function(error, res, body) {
                if (error) {
                  reject(error);
                } else if (!body.message) {
                  reject("Heroku Internal Error");
                } else if (body.message != "success") {
                  console.log(body.error);
                } else {
                  _$$_.predictions_downloads = body.predictions;
                  resolve(_$$_);
                }
              }
            );
          })
            .then(_$$_ => {
              return new Promise(function(resolve, reject) {
                // 3. Save Download hits to MySQL
                _$$_.predictions_downloads.map(
                  ({ marzocco_probability, img_id }) => {
                    var query = Cafe.saveEvaluatedPictureQuery(
                      img_id,
                      _$$_.evaluation_id,
                      marzocco_probability
                    );
                    con.query(query, function(error, result) {
                      if (error) {
                        reject(error.message);
                      } else {
                        console.log({
                          message: "success",
                          marzocco_probability: marzocco_probability
                        });
                        resolve(evaluation_id);
                      }
                    });
                  }
                );
              })
                .then(evaluation_id => {
                  // 6. Delete QueueItem from MySQL
                  var query = Queue.deleteDwlQueueItem(evaluation_id);
                  con.query(query, function(error, result) {
                    if (error) {
                      _$_.error_found = error.message;
                    }
                  });
                  _$_.waiting_for_response = false;
                })
                .catch(err => (_$_.error_found = err));
            })
            .catch(err => (_$_.error_found = err));
        }
      })
      .catch(err => (_$_.error_found = err));
  }
};
