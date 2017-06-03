var express = require('express')
var app = express()
var mysql = require('mysql')
var secret = require('./secret')
var stripe = require("stripe")(secret.stripekeys.sk_test)
var googleMapsClient = require('@google/maps').createClient({
  key: secret.googlekeys.maps
});

const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('views', __dirname + '/views')
app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile)


app.get('/', function (req, res) {
  res.render('index.html')
})

app.get('/faq', function (req, res) {
  res.render('faq.html')
})

app.post('/order', function(req, res){
  // Get the payment token submitted by the form:
  var token = req.body.stripeToken

  // Charge the user's card:
  var charge = stripe.charges.create({
    amount: 1200,
    currency: "usd",
    description: "Day Pass",
    source: token,
  }, function(err, charge) {
    // asynchronously called
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
      email: charge.source.name,
      description: charge.description
    }
    // console.log(order)

    //store charge data if successful
    connectDB('orders', order)

    //send confirmation email
    // setup email data with unicode symbols
      let mailOptions = {
          from: '"Juldi 👻" <julditest@gmail.com>', // sender address
          to: order.email, // list of receivers
          subject: 'Hello ✔', // Subject line
          text: 'Hello world ?', // plain text body
          html: '<b>Hello world ?</b>' // html body
      }

      sendMail(mailOptions)

  })
  res.render("order_confirm.html")
})

app.post('/route', function(req, res){

  googleMapsClient.geocode({
    address: req.body.start
  }, function(err, response) {
    // if (!err) {
      console.log("Geocoded result: " + response.json.results);
    //}
  });

  googleMapsClient.geocode({
    address: req.body.end
  }, function(err, response) {
    if (!err) {
      console.log(response.json.results);
    }
  });

  var route = {
    email : req.body.email,
    start : req.body.start,
    dest : req.body.end,
    arrivalTime : req.body.arrivalTime,
    departureTime : req.body.departureTime,
  }
  console.log(route)
  // store route data
  connectDB('routes', 'morningCommute', route)

  var plaintext = "Thanks for showing interest in riding with Juldi!\n" +
        "We're currently piloting our service and looking to expand to serve a wider area." +
        "As we continue to improve and expand, we'll update you as we move towards" +
        "launching a route closer to you.\n" +
        "\n-The Juldi Team";

  var htmlText = '<h2>Thanks for showing interest in riding with Juldi!</h2>' +
        "<p>We're currently piloting our service and looking to expand to serve a wider area." +
        "As we continue to improve and expand, we'll update you as we move towards" +
        "launching a route closer to you.</p>" +
        "<br><br><p>-The Juldi Team</p>";
  //send confirmation email
  // setup email data with unicode symbols
    let mailOptions = {
        from: '"Juldi" <hello@juldi.org>', // sender address
        to: route.email, // list of receivers
        subject: 'Thanks for signing up! ✔', // Subject line
        text: plaintext,
        html: htmlText
    }
    sendMail(mailOptions)

  res.render('route.html')
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})

//store data in appropriate database
function connectDB(db, table, obj) {
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
    var query = connection.query('insert into ' + table + ' set ?', obj, function (error, results, fields) {
      if (error) {
        throw error;
      }

      console.log(query.sql)
      console.log(results)
    })

    connection.release()
  })
}

//send mail using gmail account
function sendMail(message) {
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
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
  })
}
