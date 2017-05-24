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

  pool.getConnection(function(err, connection) {
    if (err) {throw err}
    var query = connection.query("select * from testAccounts where username = '" + username + "'", function(error, results, fields){
      console.log(username)
      console.log(results)
      if (results != null){
        console.log('User exists')
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
          console.log("Created user "+ username)
        })
      }
    })

    connection.release()
  }
)}

//   MongoClient.connect(mongodbUrl, function (err, db) {
//     var collection = db.collection('localUsers');
//
//     //check if username is already assigned in our database
//     collection.findOne({'username' : username})
//       .then(function (result) {
//         if (null != result) {
//           console.log("USERNAME ALREADY EXISTS:", result.username);
//           deferred.resolve(false); // username exists
//         }
//         else  {
//           var hash = bcrypt.hashSync(password, 8);
//           var user = {
//             "username": username,
//             "password": hash,
//             "avatar": "http://placepuppy.it/images/homepage/Beagle_puppy_6_weeks.JPG"
//           }
//
//           console.log("CREATING USER:", username);
//
//           collection.insert(user)
//             .then(function () {
//               db.close();
//               deferred.resolve(user);
//             });
//         }
//       });
//   });
//
//   return deferred.promise;
// };


//check if user exists
//if user exists check if passwords match (use bcrypt.compareSync(password, hash);
// true where 'hash' is password in DB)
//if password matches take into website
//if user doesn't exist or password doesn't match tell them it failed

// exports.localAuth = function (username, password) {
//   var deferred = Q.defer();
//
//   MongoClient.connect(mongodbUrl, function (err, db) {
//     var collection = db.collection('localUsers');
//
//     collection.findOne({'username' : username})
//       .then(function (result) {
//         if (null == result) {
//           console.log("USERNAME NOT FOUND:", username);
//
//           deferred.resolve(false);
//         }
//         else {
//           var hash = result.password;
//
//           console.log("FOUND USER: " + result.username);
//
//           if (bcrypt.compareSync(password, hash)) {
//             deferred.resolve(result);
//           } else {
//             console.log("AUTHENTICATION FAILED");
//             deferred.resolve(false);
//           }
//         }
//
//         db.close();
//       });
//   });
//
//   return deferred.promise;
// }
