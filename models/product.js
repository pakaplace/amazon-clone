var mongoose = require('mongoose');



var productSchema = mongoose.Schema({
	price: Number,
	description: String,
	imageUri: String
})

module.exports = mongoose.model("Product", productSchema);