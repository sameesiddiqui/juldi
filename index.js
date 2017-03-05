var express = require('express')
var app = express()
app.use(express.static('public'))
var mysql = require('mysql')
var stripe = require("stripe")("sk_test_ZnsVI5btDVpXdqsavajIxPdw")

const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var engines = require('consolidate');

app.set('views', __dirname + '/views');
app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.get('/', function (req, res) {
  res.render('index.html')
})

app.get('/route', function (req, res) {
  res.render('route.html')
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
    starttime : req.body.starttime,
    dest : req.body.end,
    desttime : req.body.endtime
  }

  // store route data
  connectDB('routes', route)

  var plaintext = "Thanks for registering your commute with us!\n" +
        "We're currently working on setting up your route. We'll shoot you an email as soon as it's available.\n" +// plain text body
        "\n-The Juldi Team";

  var htmlText = '<h2>Thanks for registering your commute with us!</h2>' + // html body
        "<p>We're currently working on setting up your route. We'll shoot you an email as soon as it's available.</p>" +
        "<br><br><p>-The Juldi Team</p>";
  //send confirmation email
  // setup email data with unicode symbols
    let mailOptions = {
        from: '"Juldi" <julditest@gmail.com>', // sender address
        to: route.email, // list of receivers
        subject: 'Thanks for signing up! ✔', // Subject line
        text: plaintext,
        html: htmlText
    }
    sendMail(mailOptions)

  res.render('route.html')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

//store data in appropriate database
function connectDB(db, obj) {
    var pool = mysql.createPool({
      connectionLimit: 50,
      host     : 'localhost',
      user     : 'root',
      password : '',
      database : db
    })

  pool.getConnection(function(error, connection){
    var query = connection.query('insert into ' + db + ' set ?', obj, function (error, results, fields) {
      if (error) {
        connection.release()
        console.error(error)
        res.json({"code" : 100, "status" : "Error in connection database"})
        return
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
          user: 'julditest@gmail.com',
          pass: 'h0usec2t'
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
