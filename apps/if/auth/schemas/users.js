var db = require('../../db');
var Schema = db.Schema;
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

var Users = db.model('Users', UsersSchema);

module.exports = Users;
