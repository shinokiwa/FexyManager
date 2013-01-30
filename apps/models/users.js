var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UsersSchema = new Schema({
	userName: String,
	password: String,
	created: {
		type: Date,
		"default": Date.now
	},
	createdUser: String,
	updated: {
		type: Date,
		"default": Date.now
	},
	updatedUser: String
});

UsersSchema.virtual('prePassword').set(function(prePassword) {
});

var Users = mongoose.model('Users', UsersSchema);

module.exports = Users;
