var express = require('express')
var app = express()
var mysql = require('mysql')
var secret = require('./secret')
var stripe = require('stripe')(secret.stripekeys.sk_test)
var googleMapsClient = require('@google/maps').createClient({
  key: secret.googlekeys.maps
})
const mail = require('./lib/mail');

const bodyParser = require('body-parser')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.set('views', __dirname + '/views')
app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile)


app.get('/', function (req, res) {
  res.render('index.html')
})

app.get('/faq', function (req, res) {
  res.render('faq.html')
})

app.get('/routes', function (req, res) {
  res.render('routes.html')
})

app.get('/commuteinfo', function (req, res) {
  res.render('commuteinfo.html')
})

  //=========STRIPE PAYMENT HANDLING
app.post('/order/:passType', async (req, res) => {
  console.log(req.body)
  var token = req.body.stripeToken
  var passPrice
  var passDescrip

  switch (req.params.passType) {
    case 'day':
      passPrice = 1400
      passDescrip = 'Day Pass'
      break
    case 'week':
      passPrice = 6000
      passDescrip = 'Week Pass'
      break
    case 'one-way-day':
      passPrice = 700
      passDescrip = 'One way day pass ' + req.body.timebtn
      break
    case 'one-way-week':
      passPrice = 3000
      passDescrip = 'One way week pass ' + req.body.timebtn
      break
  }

  var charge = stripe.charges.create({
    amount: passPrice,
    currency: 'usd',
    description: passDescrip,
    receipt_email: req.body.cardholder_email,
    source: token
  }, function (err, charge) {
    if (err) {
      if (err.type === 'StripeCardError') {
        debug('Card declined: %s', err.message)
        return res.send({
          err: 'Your card was declined.'
        })
      } else {
        console.log(err)
      }
    }
    // order object to store
    console.log(charge)
    var order = {
      name: req.body.cardholder_name,
      email: req.body.cardholder_email,
      phone: req.body.phone_num,
      zip: req.body.address_zip,
      description: charge.description
    }
    // console.log(order)

    //store charge data if successful
    insert('juldi', 'orders', order).then((orderID) => {
      let passInfo = {
        passType: order.description,
        passCode: orderID,
        name: order.name,
        startDate: 'Jun 19',
        endDate: 'Jun 26'
      }
      mail.sendPass(passInfo, order.email);
    })

    var plaintext = "Thanks for deciding to ride with Juldi!\n" +
    "This email is confirming the purchase of a pass from us:\n" +
    order.description + "\n" +
    "We're excited to have you ride with us when the route launches on June 19. " +
    "Until then, we'll keep you updated on any news you need to know and send you " +
    "all your route information promptly. We're looking forward to " +
    "serving you!\n\n" + "-The Juldi Team"

    var htmltext = "<h2>Thanks for deciding to ride with Juldi! </h2>" +
    "<p>This email is confirming the purchase of a pass from us: </p>" +
    "<p>" + order.description + "</p>" + "<br>" +
    "<p>We're excited to have you ride with us when the route launches on Monday, June 19. " +
    "Until then, we'll keep you updated on any news you need to know and send you " +
    "all your route information promtly.</p> <br> <p>We're looking forward to " +
    "serving you!</p> <br>" + "<p>-The Juldi Team</p>"
    //send confirmation email
    // setup email data with unicode symbols
    let confirmMailOptions = {
        from: '"Juldi" <hello@juldi.org>', // sender address
        to: order.email, // list of receivers
        subject: 'Thanks for purchasing a pass! ✔', // Subject line
        text: plaintext,
        html: htmltext
    }

    mail.sendMail(confirmMailOptions)
  })
  res.render('order_confirm.html')
})


// =========COMMUTE INFO FORM

app.post('/commuteinfo', function (req, res) {
  var promise = new Promise(function (resolve, reject) {
    googleMapsClient.geocode({
      address: req.body.start
    }, function (err, response) {
       if (!err) {
         var geocodedStart = response.json.results[0].geometry.location
         //run another geocode to get end address
         googleMapsClient.geocode({
           address: req.body.end
         }, function (err, response) {
            if (!err) {
              var geocodedEnd = response.json.results[0].geometry.location
              var geocoded = {
                start: geocodedStart,
                end: geocodedEnd
              }
              resolve(geocoded)
            } else {
              reject("Couldn't get geocoded address")
            }
         })
       } else {
         reject("Couldn't get geocoded address")
       }
    })
  })

  promise.then((geocoded) => {
    //console.log(JSON.stringify(geocoded))

  var route = {
    email: req.body.email,
    start: req.body.start,
    end: req.body.end,
    arrivalTime: req.body.arrivalTime,
    departureTime: req.body.departureTime,
    startCoords: JSON.stringify(geocoded.start),
    endCoords: JSON.stringify(geocoded.end)
  }
  console.log(route)
  // store route data
  insert('juldi', 'commuteInfo', route)

  var plaintext = "Thanks for showing interest in riding with Juldi!\n" +
        "We're currently piloting our service and looking to serve a wider area. " +
        "In the next few days, we'll update you when we can launch your route. " +
        "\nIf you know anyone with a similar commute, let them know " +
        "about Juldi so we can build your route sooner.\n" +
        "\n-The Juldi Team"

  var htmlText = '<h2>Thanks for showing interest in riding with Juldi! </h2>' +
        "<p>We're currently piloting our service and looking to serve a wider area. " +
        "In the next few days, we'll update you when we can launch your route. </p>" +
        "<p>If you know anyone with a similar commute, let them know " +
        "about Juldi so we can build your route sooner.</p>" +
        "<br><br><p>-The Juldi Team</p>"
  //send confirmation email
  // setup email data with unicode symbols
    let mailOptions = {
        from: '"Juldi" <hello@juldi.org>', // sender address
        to: route.email, // list of receivers
        subject: 'Thanks for registering your commute! ✔', // Subject line
        text: plaintext,
        html: htmlText
    }
    mail.sendMail(mailOptions)

  res.render('commuteinfo.html')
  })
  .catch((failure) => {
    console.log(failure)
    res.render('commuteinfo.html')
  })
})

app.listen(8080, function () {
  console.log('Juldi listening on port 8080!')
})

//store data in appropriate database
function insert(db, table, obj) {
  var pool = mysql.createPool({
    connectionLimit: 20,
    host     : secret.dbinfo.host,
    socketPath: secret.dbinfo.socketPath,
    user     : secret.dbinfo.user,
    password : secret.dbinfo.password,
    database : db
  })
    //console.log(pool)
  let promise = new Promise(function(resolve, reject) {
    pool.getConnection(function (error, connection) {
      if (error) {
        console.error(error)
        reject(error)
      }
      var query = connection.query('insert into ' + table + ' set ?', obj, function (error, results, fields) {
        if (error) {
          throw error
        }

        console.log(query.sql)
        console.log(results)
        resolve(results.insertId)
      })

      connection.release()
    })
  })

  return promise
}

function select(db, table, id) {
  let pool = mysql.createPool({
    connectionLimit: 20,
    host: secret.dbinfo.host,
    socketPath: secret.dbinfo.socketPath,
    user: secret.dbinfo.user,
    password: secret.dbinfo.password,
    database: db
  });

  pool.getConnection((err, conn) => {
    if (err) {
      console.error(err);
    }

    let query = connection.query('select * from ')
  })
}
