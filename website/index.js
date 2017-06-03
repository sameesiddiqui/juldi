var express = require('express')
var app = express()
var mysql = require('mysql')
var secret = require('./secret')
var stripe = require('stripe')(secret.stripekeys.sk_test)
var googleMapsClient = require('@google/maps').createClient({
  key: secret.googlekeys.maps
})

const nodemailer = require('nodemailer')
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

app.get('/commuteinfo', function (req, res) {
  res.render('commuteinfo.html')
})

  //=========STRIPE PAYMENT HANDLING
app.post('/order', function (req, res) {
  var token = req.body.stripeToken

  var charge = stripe.charges.create({
    amount: 7000,
    currency: 'usd',
    description: 'Juldi Week Pass',
    source: token
  }, function (err, charge) {
    if (err) {
      if (err.type === 'StripeCardError') {
        debug('Card declined: %s', err.message)
        return res.send({
          err: 'Your card was declined.'
        })
      } else {
        var errors = values(err.errors).map((err) => err.message)
        return res.send({
          err: errors.join('. ')
        })
      }
    }
    // order object to store
    var order = {
      name: charge.source.name,
      email: charge.source.email,
      description: charge.description
    }
    // console.log(order)

    //store charge data if successful
    connectDB('orders', order)


    var plaintext = "Thanks for deciding to ride with Juldi!\n" +
    "This email is confirming the purchase of a pass from us:\n" +
    order.description + "\n" +
    "We're excited to have you ride with us when the route launches on June 19. " +
    "Until then, we'll keep you updated on any news you need to know and send you " +
    "all your route information a few days before the 19th. We're looking forward to " +
    "serving you!\n\n" + "-The Juldi Team"

    var htmltext = "<h2>Thanks for deciding to ride with Juldi!</h2?" +
    "<p>This email is confirming the purchase of a pass from us:</p>" +
    "<p>" + order.description + "</p>" + "<br>" +
    "<p>We're excited to have you ride with us when the route launches on June 19. " +
    "Until then, we'll keep you updated on any news you need to know and send you " +
    "all your route information a few days before the 19th.</p> <br> <p>We're looking forward to" +
    "serving you!</p> <br>" + "<p>-The Juldi Team</p>"
    //send confirmation email
    // setup email data with unicode symbols
      let mailOptions = {
          from: '"Juldi" <hello@juldi.org>', // sender address
          to: order.email, // list of receivers
          subject: 'Thanks for purchasing a pass! ✔', // Subject line
          text: plaintext,
          html: htmltext
      }

      sendMail(mailOptions)

  })
  res.render("order_confirm.html")
})


//=========SIGN UP FORM

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
  connectDB('routes', 'commuteInfo', route)

  var plaintext = "Thanks for showing interest in riding with Juldi!\n" +
        "We're currently piloting our service and looking to serve a wider area. " +
        "As we continue to improve and expand, we'll update you as we move towards " +
        "launching a route closer to you.\n" +
        "\n-The Juldi Team"

  var htmlText = '<h2>Thanks for showing interest in riding with Juldi!</h2>' +
        "<p>We're currently piloting our service and looking to serve a wider area. " +
        "As we continue to improve and expand, we'll update you as we move towards " +
        "launching a route closer to you.</p>" +
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
    sendMail(mailOptions)

  res.render('commuteinfo.html')
  })
  .catch((failure) => {
    console.log(failure)
  })
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})

//store data in appropriate database
function connectDB (db, table, obj) {
    var pool = mysql.createPool({
      connectionLimit: 20,
      host     : secret.dbinfo.host,
      //socketPath: secret.dbinfo.socketPath,
      user     : secret.dbinfo.user,
      password : secret.dbinfo.password,
      database : db
    })
    //console.log(pool)

  pool.getConnection(function (error, connection) {
    if (error) {
      console.error(error)
    }
    var query = connection.query('insert into ' + table + ' set ?', obj, function (error, results, fields) {
      if (error) {
        throw error
      }

      console.log(query.sql)
      console.log(results)
    })

    connection.release()
  })
}

//send mail using gmail account
function sendMail (message) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: secret.emailinfo.user,
          pass: secret.emailinfo.pass
      }
  })

  // send mail with defined transport object
  transporter.sendMail(message, (error, info) => {
      if (error) {
          return console.log(error)
      }
      console.log('Message %s sent: %s', info.messageId, info.response)
  })
}
