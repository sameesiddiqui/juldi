const bcrypt = require('bcryptjs');
const secret = require('./secret.js');
const mysql = require('mysql');

exports.localReg = (regData) => {
  // establish database settings
  const pool = mysql.createPool({
    connectionLimit: 20,
    host: secret.dbinfo.host,
    user: secret.dbinfo.user,
    password: secret.dbinfo.password,
    database: 'website',
  });
  // create promise
  let promise = new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) { throw err; }

      // check if we already have an email registered
      // if not, go through process of creating user in DB
      // sanitize this query with ?
      let query = connection.query("select email from users where email = '"
      + regData.email + "'", (error, results, fields) => {
        if (results[0] !== regData.email) {
          let hash = bcrypt.hashSync(regData.password, 10);
          let user = {
            // add other user information later
            name: regData.fullName,
            email: regData.email,
            password: hash,
          }

          connection.query('insert into users set ?', user, (error, results, fields) => {
            if (error) { throw error; }
            resolve(regData.fullName);
          });
          // if the email has been registered, return an error msg
        } else {
          reject('This email has already been registered.');
        }
      });
      connection.release();
    });
  });
  return promise;
};

// user login system
exports.localAuth = (email, password) => {
  // establish DB settings
  let pool = mysql.createPool({
    connectionLimit: 20,
    host: secret.dbinfo.host,
    user: secret.dbinfo.user,
    password: secret.dbinfo.password,
    database: 'website',
  });

  let promise = new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) throw error;
      // get userID and password if we have a matching email
      connection.query('select userID, password from users where email=\''
      + email + '\'', (error, results, fields) => {
        // compare password with our hash
        if (results[0].password && bcrypt.compareSync(password, results[0].password.toString())) {
          let userID = results[0].userID;
          resolve(userID);
        } else {
          reject('Incorrect email or password');
        }
      });
      connection.release();
    });
  });
  return promise;
}
