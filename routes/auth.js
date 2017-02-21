// Add Passport-related auth routes here.

var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Shipping = require('../models/shipping');
var accountSid = 'ACd65bda7a9e595d2428b1cf04a87ccb84'; 
var authToken = '8ca4f09ceb6069002c5b3e5ae57f18b1'; 
var myNumber = "+17274697564"; 
var twilio = require('twilio')(accountSid, authToken);
//sk_test_VCLuttUKCkr1wWJNibSPiItb
//pk_test_4gXzvafc5MkxqBTAje4wXLBs


module.exports = function(passport) { //
// function to generate random code
function randomCode() {
  var min = 1000;
  var max = 9999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


  // GET registration page
  router.get('/signup', function(req, res) {
    res.render('signup');
  });

  // POST registration page
  var validateReq = function(userData) {
    return (userData.password === userData.passwordRepeat);
  };

  router.post('/signup', function(req, res) {
    // validation step
    if (!validateReq(req.body)) {
      return res.render('signup', {
        error: "Passwords don't match." //values that are passed on get used in hbs template file {{}}
      });
    }
    var randomCode2 = randomCode();
    randomCode2 = randomCode2.toString();
    var u = new User({
      username: req.body.username,
      password: req.body.password,
      code: randomCode2
    });
    u.save(function(err, user) {
      if (err) {
        console.log(err);
        res.status(500).redirect('/signup'); //line up with file in views
        return;
      }
      twilio.messages.create({
        to: req.body.username, 
        from: myNumber, 
        body: randomCode2
      }, function(err, message){
        console.log(err);
        if(err){
          console.log("success")
        }
      });
      res.redirect('/verify/'+u._id);
    });
  });
  // router.use(function(req, res, next) {
  // if(!req.user.defaultShipping){
  //     console.log("Test " + req.user.defaultShipping);
  //     res.redirect('/shipping');
  //   }
  //   else {
  //     console.log("Not working")
  //     return next();
  //   }
  // });
  //VERIFY POST
  router.get('/verify/:id', function(req, res){
    res.render('verify');
  });

  router.post('/verify/:id', function(req, res, next){
    User.findById(req.params.id, function(err, user){
      if(err){
        console.log("User not found")
        return;
      }
      console.log("REQ.BODY"+ req.body.code);
      console.log("user.code"+ user.code);
      console.log("User Verified1"+user.verified);
      if(user.code === req.body.code){
        user.verified = true;
        user.save(function(err){
          if(err){
            return next(err);
          }
          res.redirect("/login")
          console.log("User Verified2"+user.verified);
          return;
        });
      }
      else{
        res.render("verify", {
          error:"Wrong validation code"
        });
      }
    })
    
  });

  // GET Login page
  router.get('/', function(req, res) {
    res.redirect('/login');
  });


  router.get('/login', function(req, res) {
    res.render('login');
  });

  // POST Login page
  router.post('/login', passport.authenticate('local'), function(req, res) {
    if(req.user.verified===true){
      res.redirect('/shipping');
    }
    else{
      res.redirect('/verify/'+req.user._id);
    }
  });

  // Facebook Login
  router.get('/auth/facebook',
  passport.authenticate('facebook'));

  router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home. 
    res.redirect('/products');
    
  });
  


  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });
  router.get('/shipping', function(req, res){
    res.render('shipping');
  })

  return router;
}


