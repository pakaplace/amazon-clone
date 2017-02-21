var express = require('express');
var router = express.Router();
var Shipping = require('../models/shipping');
var User = require('../models/user');
var Product = require('../models/product');
var Payment = require('../models/payment');
var Order = require('../models/order');
var stripe = require("stripe")("sk_test_VCLuttUKCkr1wWJNibSPiItb");


// THE WALL~ checks if user is logged in
router.use(function(req, res, next) {
	if (!req.user) {
		res.redirect('/login');
	} 
	return next();
})

/* GET home page. */







router.use(function(req, res, next) {
	if(!req.user.defaultShipping){
			res.redirect('/shipping');
		}
		else {
			console.log("Not working")
			return next();
		}
	});
router.get('/shipping', function(req, res){
    res.render('shipping');
})

router.post('/shipping', function(req, res){
	var s = new Shipping({
		name: req.body.name,
		address1: req.body.address,
		address2: req.body.address2,
		city: req.body.city,
		state: req.body.state,
		zip: req.body.zipCode,
		phone: req.user.username,
// status: req.body.status, 
		parent: req.user._id
	});

	s.save(function(err, address) { //user id is the id of shipping object
		console.log("saved");
		if (err) {
			console.log(err);
			res.status(500).redirect('/shipping'); //line up with file in views
			return;
		}
		console.log("address.parent: ", address.parent);
		User.findByIdAndUpdate(address.parent, { //req.user._id
			defaultShipping: address._id
		}, function(err){
			if (err) {
				console.log(err);
				res.status(500).redirect('/shipping'); //line up with file in views
				return;
			}
			res.redirect('/stripe') 									//finds user and updates their defautl shipping property
			})
	})
})


// console.log("address.parent: ", address.parent);
// 		User.findByIdAndUpdate(address.parent, { //req.user._id
// 			defaultShipping: address.parent
// 		}, function(err){
// 			if (err) {
// 				console.log(err);
// 				res.status(500).redirect('/shipping'); //line up with file in views
// 				return;
// 			}
// 			res.redirect('/products') 									//finds user and updates their defautl shipping property
// 			})
// 	})
// })
router.get('/stripe', function(req, res){
	res.render('stripe')
})
router.post('/stripe', function(req, res){
	console.log(req.body.stripeEmail);
	console.log(req.body.stripeToken);

	stripe.customers.create({
		description: req.body.stripeEmail,
		source: req.body.stripeToken // obtained with Stripe.js

	}, function(err, customer) {
		if(err){
			console.log(err)
			return;
		}
		else{
			var card = customer.sources.data[0];
			var payment = new Payment({
				stripeBrand: card.stripeBrand,
				stripeCustomerId: customer.id,
				stripeExpMonth: card.exp_month,
				stripeExpYear: card.exp_year,
				stripeLast4: card.last4,
				stripeSource:card.id,
				parent: req.user._id
			});
			console.log(payment);
			payment.save(function(err, payment){
				if(err){
					console.log("payment.save error");
				}
				else{
				User.findByIdAndUpdate(payment.parent, {
					defaultPayment: payment._id
				}, function(err){
					if(err){
						console.log(err);
						res.status(500).redirect('/stripe');
						return;
					}
					res.redirect('/products')
					})
				}
			});
		}
	});
})
router.use(function(req, res, next) {
  if(!req.user){
    res.redirect('/login')
  }
  if(!req.user.defaultPayment){
    res.redirect('/stripe')
  }
  else {
    console.log("Not working")
    return next();
    }
  });




//===========================================================================================================================
//============      =====  ======       =====         ===================================================================
//=========== ========== == ====== =====  =======  ==============================================================
//============ ========      ===== ====  ========  ==============================================================
//=============     == ======= === ======= ======  ==============================================================================
//===========================================================================================================================
router.get('/products', function(req, res){
	//product.find() inside callback handle error and res.render, 
	Product.find(function(error, products) {
		res.render('products', {
		products: products
	})
	
});
})
router.get('/products/:id', function(req, res){
	//product.find() inside callback handle error and res.render, 
	Product.findById(function(error, product) {
		res.render('products', {
		product: product
	})
	
});
})

router.use(function(req, res, next) {
  if (!req.session)
    return next(new Error("Session error"));

  req.session.cart = req.session.cart || [];
  next();
});



	
router.get('/cart', function(req, res, next) {
  // Render a new page with our cart	
  	res.render('cart', {
  	cart:req.session.cart
  	});
});

router.get('/cart/add/:pid', function(req, res, next) {
  Product.findById(req.params.pid, function(err, product){
  	if(err){
  		console.log("Product cannnot be added")
  	}
  	req.session.cart.push(product);
  	res.redirect('/cart');
  })
})
//use handlebars to attach id to link
router.get('/cart/delete/:sid', function(req, res, next) {
  Product.findById(req.params.pid, function(error, product){
  	if(err){
  		console.log("Product cannot be deleted")
  	}
  	var position =req.session.cart.indexOf(product);
  	req.session.cart.slice(position, position+1);
  	res.redirect('/cart')
  })
});

router.get('/cart/delete', function(req, res, next) {
  // Empty the cart array
  req.session.cart = [];
  res.redirect('/products')
});
router.post('/cart', function(req, res, next) {
  // Empty the cart array
  var total = 0;
  var numItems=0;
	console.log("CART "+req.session.cart[0].price)
  for(var i = 0; i<req.session.cart.length; i++){
  	console.log(req.session.cart[i].price)
  	console.log(typeof req.session.cart[i].price)
  	total += req.session.cart[i].price;
  	numItems++;
  }
  console.log("Total "+total);
  var newOrder = new Order({
  	timestamp: Date.now(),
  	order: req.session.cart,
  	user: req.user.id,//user id,
  	payment: req.user.defaultPayment,
  	shipping: req.user.defaultShipping,
  	subtotal: total,
  	numberItems: numItems 
  });
  newOrder.save(function(err, order){
  	if(err){
  		console.log(err);
  		return;
  	}
  	else{
  		res.redirect('/order/' + order._id);
  	}
  }); //save in database
});

router.get('/order/:id', function(req, res) {

	Order.findById(req.params.id).populate('shipping').exec(function(err, order) {
		res.render('order', {
  			order: order
  		});
  		console.log("ORDER-----   "+order)
	})
})



module.exports = router;
