var mysql = require('mysql')
var PRODUCTION_DB = 'production db'
var TEST_DB = 'orders'

exports.MODE_TEST = 'mode_test'
exports.MODE_PRODUCTION = 'mode_production'

var state = {
  mode: null,
  pool: null,
}

// exports.connect = function(mode) {
//   state.pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
//   });
//
//   state.mode = mode
// }

module.exports.connect = function(db) {
  mysql.createPool({
    connectionLimit: 50,
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : db
  });
}


exports.get = function() {
  return state.pool
}
