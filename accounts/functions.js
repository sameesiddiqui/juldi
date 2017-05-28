var bcrypt = require('bcryptjs')
var Q = require('q')
var config = require('./config.js')

var mysql = require('mysql')

//used in local-signup strategy
exports.localReg = function (username, password) {

  var pool = mysql.createPool({
    connectionLimit:20,
    host: config.dbinfo.host,
    user: config.dbinfo.user,
    password: config.dbinfo.password,
    database: 'routes'
  })

let promise = new Promise(function(resolve, reject) {
  pool.getConnection(function(err, connection) {
    if (err) {throw err}

    var query = connection.query("select * from testAccounts where username = '" + username + "'", function(error, results, fields){

      console.log(results)
      if (results.length !== 0){
        reject('User exists')
      } else {
        var hash = bcrypt.hashSync(password, 8);
        var user = {
          "username": username,
          "password": hash,
          "avatar": "http://placepuppy.it/images/homepage/Beagle_puppy_6_weeks.JPG"
        }

        console.log("Creating user "+ username)
        connection.query('insert into testAccounts set ?', user, function(error, results, fields){
          if (error) {throw error}
          resolve(username)
        })
      }
    })

    connection.release()
  })
});
  return promise
}

//check if user exists
//if user exists check if passwords match (use bcrypt.compareSync(password, hash);
// true where 'hash' is password in DB)
//if password matches take into website
//if user doesn't exist or password doesn't match tell them it failed

exports.localAuth = (username, password) => {
  var pool = mysql.createPool({
    connectionLimit: 20,
    host: config.dbinfo.host,
    user: config.dbinfo.user,
    password: config.dbinfo.password,
    database: 'routes'
  })

  let promise = new Promise(function(resolve, reject) {
    pool.getConnection(function(error, connection){
      if (error) throw error
      var query = connection.query("select * from testAccounts where username = \'" +
       username + "\'", function(error, results, fields){
        if (results.length !== 0) {
          var hash = results[0].password
          console.log("found user doe")

          if (bcrypt.compareSync(password, hash.toString())) {
            console.log("Authentication confirmed")
            resolve(results[0])
          } else {
            console.log("Authentication failed")
            reject("Auth failed")
          }
        } else {
          console.log("username not found fam")
        }
      })
    })
  });

  return promise;
}
