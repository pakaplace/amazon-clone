var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate')

var userSchema = mongoose.Schema({
	username: {
		type: String,
		required: true
		}, //this is a phone number (passport requires username)
	password: {
		type: String,
		required: true
		},
	code: {
		type: String,
		required: true
		},
	verified: {
		type: Boolean,
		default: false
	},
	facebookId:{
		type: String,
		required: false
	},
	defaultShipping:{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Shipping"
	},
	defaultPayment:{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Payment"
	} 
});

userSchema.plugin(findOrCreate);

module.exports = mongoose.model("AmazonUser", userSchema);