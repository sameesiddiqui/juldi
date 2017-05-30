var express = require('express')
var exphbs = require('express-handlebars')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var session = require('express-session')
var passport = require('passport')
var LocalStrategy = require('passport-local')
// var TwitterStrategy = require('passport-twitter')
// var GoogleStrategy = require('passport-google')
// var FacebookStrategy = require('passport-facebook')
var MySQLStore = require('express-mysql-session')(session);
var options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'session_test'
};

var sessionStore = new MySQLStore(options);
//We will be creating these two files shortly
var config = require('./config.js') //config file contains all tokens and other private info
var funct = require('./functions.js') //funct file contains our helper functions for our Passport and database work

var app = express()

//===============PASSPORT===============

// Passport session setup.
passport.serializeUser(function(user, done) {
  console.log("serializing " + user.username);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + JSON.stringify(obj));
  done(null, obj);
});

//This section will contain our work with Passport
// Use the LocalStrategy within Passport to login/"signin" users.
passport.use('local-signin', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localAuth(username, password)
    .then(function (user) {

      console.log("Logged in: " + user.username);
      req.session.success = 'You are successfully logged in ' + user.username + '!';
      return done(null, user);
    }, (failure) => {

      console.log("could not log in");
      req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
      return done(null, failure)
  }).catch(console.log)
  }
));
// Use the LocalStrategy within Passport to register/"signup" users.
passport.use('local-signup', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localReg(username, password)
    .then(function (user) {

        console.log("REGISTERED: " + user.username);
        req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
        return done(null, user);
      }, (failure) => {

        console.log("COULD NOT REGISTER");
        req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
        return done(null, failure)
    }).catch(console.log)
  }
));

//===============EXPRESS================
// Configure Express

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
//app.use(methodOverride('X-HTTP-Method-Override'))
app.use(session({ key: 'gort', secret: 'supernova', store: sessionStore, saveUninitialized: true, resave: true}))
app.use(passport.initialize())
app.use(passport.session())

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error
  var msg = req.session.notice
  var success = req.session.success

  delete req.session.error
  delete req.session.success
  delete req.session.notice

  if (err) res.locals.error = err
  if (msg) res.locals.notice = msg
  if (success) res.locals.success = success

  next()
});

// Configure express to use handlebars templates
var hbs = exphbs.create({
    defaultLayout: 'main', //we will be creating this layout shortly
})
app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

//===============ROUTES===============

//displays home page
app.get('/', function(request, response){
  response.render('home', {user: request.user})
})

//displays sign in page
app.get('/signin', function(request, response){
  response.render('signin')
})

//sends request to signin strategy
app.post('/local-reg', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/signin'
  })
)

//sends request to signin
app.post('/login', passport.authenticate('local-signin', {
  successRedirect: '/',
  failureRedirect: '/signin'
  })
)

//logout of the session
app.get('/logout', function(req, res){
  var name = req.user.username
  console.log("Logging out "+ name)
  console.log(JSON.stringify(req.logout))
  req.logout()
  res.redirect('/')
  req.session.notice = "You've successfully been logged out of " + name + "!"
})


//===============PORT=================
var port = process.env.PORT || 5000 //select your port or let it pull from your .env file

app.listen(port, function() {
  console.log("listening on " + port + "!")
})
