var mongoose = require('mongoose');


var orderSchema = mongoose.Schema({
	timestamp:{
		type: String,
		required: true
	},
	order:{
		type: Array,
		required: true
	},
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	payment:{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Payment"
	},
	shipping:{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Shipping" //link to document inside the shipping collection
	},
	status:{
		type: Object,
		required: false 
	},
	subtotal:{
		type: Number
	},
	total:{
		type: Number,
		required: false 
	},
	numberItems:{
		type: Number,
		required: false
	}
});


module.exports = mongoose.model("Order", orderSchema);