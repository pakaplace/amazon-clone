// Note, you won't be able to see any products because we are not writing any routes to "create" new products... 
// yet. Instead, we are going to seed our database with existing product data from the products.json file.

// You will need to create your own script to seed the database. Think about what you need to do logically. 
// You have a json file that contains a bunch of product objects. You need to map these objects do your data model 
// and save them in MongoDB (loop through each JSON object and create an object in Mongo).
var Product = require('./models/product');
//initialize mongoose and mongoose.connect
var mongoose = require('mongoose');
var connect = process.env.MONGODBI_URI || require('./models/connect');
mongoose.connect(connect);


var products = [{"price":9.99,"imageUri":"https://images-na.ssl-images-amazon.com/images/I/61rOt2JB5mL._SL1000_.jpg","description":"Makes toast. With Hello Kitty on it. This is a MUST own.","title":"Hello Kitty Toaster"},
{"price":12.25,"imageUri":"http://ichef-1.bbci.co.uk/news/1024/media/images/65438000/png/_65438509_visort.png","description":"Blocks facial recognition software from recognizing you. So, you know, Ethan can't hack you.","title":"Privacy Visor"},
{"price":42.00,"imageUri":"https://images.vat19.com/covers/large/10-foot-pogo-stick.jpg","description":"With this classic, you can bounce around the classroom faster than ever before. Challenge your classmates to see who can jump the highest!","title":"Pogo stick"}]

for(var i = 0 ; i< products.length; products++){
	var product = new Product({
		title: products[i].price,
		description: products[i].description,
		imageUri: products[i].imageUri
	});
	product.save(function(err, success){
		if(err){
			console.log(err);
			return;
		}
		console.log("success");
	})
}