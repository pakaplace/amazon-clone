var express = require('express'); //lines one to 6 came from express generator
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
//ROUTES
var routes = require('./routes/index');
var auth = require('./routes/auth');
//MODELS
var User = require('./models/user')

var passport = require('passport');
var LocalStrategy = require('passport-local');
var FacebookStrategy = require('passport-facebook');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo/es5')(session); //saves session into DB so user data isn't lost

var findOrCreate = require('mongoose-findorcreate')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//CONNECT- cannot use connect.js since you will publicly display your connect js
var connect = process.env.MONGODBI_URI || require('./models/connect');
mongoose.connect(connect);

app.use(session({
    secret: process.env.SECRET,
    //name: 'Catscoookie',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    // proxy: true,
    // resave: true,
    // saveUninitialized: true
}));

app.use(passport.initialize()); //getting things out of order with passport = extreme errors
app.use(passport.session());

passport.serializeUser(function(user, done) {
 done(null, user._id);
});

passport.deserializeUser(function(id, done) {
 User.findById(id, function(err, user) {
   done(err, user);
 });
});

passport.use(new LocalStrategy(function(username, password, done) {
    // Find the user with the given username
    User.findOne({ username: username }, function (err, user) {
      // if there's an error, finish trying to authenticate (auth failed)
      if (err) {
        console.error(err);
        return done(err);
      }
      // if no user present, auth failed
      if (!user) {
        console.log(user);
        return done(null, false, { message: 'Incorrect username.' });
      }
      // if passwords do not match, auth failed
      if (user.password !== password) {
        console.log("INcorrect password")
        return done(null, false, { message: 'Incorrect password.' });
      }
      console.log("THROUGH")
      // auth has has succeeded
      return done(null, user);
    });
  }
));
  passport.use(new FacebookStrategy({
    clientID: '690453174439055',
    clientSecret: '5fb6716ad60bbede5ca3835652d5a7e1',
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, {
      username: "asf32qqerasfaer", //generateid
      password: "uheoriglhpw4i5er", //generateId
      facebookId: profile.id 
    }, function (err, user) {
      return cb(err, user);
    });
  }
));


  app.use('/', auth(passport)); //Use after I've defined strategy, etc. 
  app.use('/', routes);

// error handlers
// catch 404 and ford to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
