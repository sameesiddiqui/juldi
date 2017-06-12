var express = require('express')
var app = express()
app.use(express.static('public'))
var mysql = require('mysql')
//var secret = require('./secret')
var fs = require('fs')

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('views', __dirname + '/views')
app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile)


app.get('/', function (req, res) {
  res.render('index.html')
})

app.listen(8081, function () {
  console.log('Example app listening on port 8081!')
  //connectDB('routes', 'morningCommute')
})

function connectDB(db, table) {
    var pool = mysql.createPool({
      connectionLimit: 20,
      host     : secret.dbinfo.host,
      socketPath: secret.dbinfo.socketPath,
      user     : secret.dbinfo.user,
      password : secret.dbinfo.password,
      database : db
    })
    //console.log(pool)

  pool.getConnection(function(error, connection){
    if (error) {
      console.error(error)
    }
    var query = connection.query('SELECT * FROM ' + table, function (error, results) {
      if (error) {
        throw error
      } else {
        fs.writeFileSync('./data.json', JSON.stringify(results, null, 4), 'utf-8')
      }
      //console.log(query.sql)
      //console.log(results)
    })

    connection.release()
  })
}
