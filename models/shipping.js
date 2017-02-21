var mongoose = require('mongoose');

var shippingSchema = mongoose.Schema({
	name: String, // ask
	address1: String, // ask
	address2: String, // ask
	city: String, // ask
	state: String, // ask
	zip: String, // ask
	phone: String,
	status: Number, 
	parent: mongoose.Schema.Types.ObjectId 
});

module.exports = mongoose.model("Shipping", shippingSchema);//you'll get the user model anywhere that you var require user