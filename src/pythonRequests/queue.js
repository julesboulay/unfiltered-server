const mysql = require("mysql");
const queue_img = require("./queue_img");
const queue_dwl = require("./queue_dwl");

// #. Set Up MySQL
//const config = require("../../config/config_test")["production"];
const config = require("../../config/config")["development"];
var connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  port: config.database.port,
  password: config.database.password,
  database: config.database.db
});
connection.connect();

// #. Set Up Queue

function sleep_(_ms) {
  return new Promise(resolve => setTimeout(resolve, _ms));
}

async function pythonDownloadRequestsQueue(connection) {
  let ImageRequestQueue = new queue_img(connection);
  let DownloadRequestQueue = new queue_dwl(connection);

  let _$_ = {
    waiting_for_response: false,
    current_request: "",
    img_queue_was_empty: false,
    dwl_queue_was_empty: false,
    error_found: undefined
  };

  while (!_$_.error_found) {
    if (_$_.waiting_for_response) {
      console.log("Waiting for: " + _$_.current_request);
      await sleep_(500);
    } else if (_$_.img_queue_was_empty && _$_.dwl_queue_was_empty) {
      console.log("Queue is Empty");
      await sleep_(500);
      _$_.img_queue_was_empty = false;
      _$_.dwl_queue_was_empty = false;
      _$_.current_request = "";
    } else if (_$_.img_queue_was_empty) {
      await DownloadRequestQueue.requestDwlPrediction(_$_);
    } else {
      await ImageRequestQueue.requestImgPrediction(_$_);
    }
  }

  // Some Error Found
  console.log(
    "Error Found on Python Donwload Requests Queue: " + _$_.error_found
  );
}

pythonDownloadRequestsQueue(connection);
