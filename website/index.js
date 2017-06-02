var express = require('express')
var app = express()
app.use(express.static('public'))
var mysql = require('mysql')
var stripe = require("stripe")("sk_test_ZnsVI5btDVpXdqsavajIxPdw")
//var secret = require('./secret')


const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
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
// Set your secret key: remember to change this to your live secret key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys

  // Get the payment token submitted by the form:
  var token = req.body.stripeToken // Using Express

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
  var route = {
    email : req.body.email,
    start : req.body.start,
    dest : req.body.end,
    timehrs : req.body.hrs,
    timemins : req.body.mins,
    timeampm : req.body.ampm
  }
  console.log(route)
  // store route data
  connectDB('routes', 'morningCommute', route)

  var plaintext = "Thanks for registering your commute with us!\n" +
        "We're currently working on setting up your route. We'll shoot you an email as soon as it's available.\n" +// plain text body
        "\n-The Juldi Team";

  var htmlText = '<h2>Thanks for registering your commute with us!</h2>' + // html body
        "<p>We're currently working on setting up your route. We'll shoot you an email as soon as it's available.</p>" +
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
    console.log(pool)

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
