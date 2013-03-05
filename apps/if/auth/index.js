var Users = require ('./schemas/users');
var log = require ('../../log');
var crypto = require('crypto');

module.exports.login = function(name, pass, next) {
	log.debug ("[Controllers.user]Start to finding user : " + name);
	return Users.find({
		userName: name,
		password: encrypt(pass)
	}, function(err, data) {
		if (data.length > 0) {
			log.debug ("[Controllers.user]User found.");
			user = {
				auth: true,
				userName: data.userName
			}
			return next(err, '', user);
		} else {
			var msg = 'Invalid ID or Password.';
			log.debug ("[Controllers.user]" + msg);
			return next(err, msg, {auth: false});
		}
	});
};

module.exports.create = function(name, pass, next) {
	log.debug ("[Controllers.user]Start to Create user : " + name);
	return Users.find({
		userName: name
	}, function(e, data) {
		if (data.length > 0) {
			log.debug ("[Controllers.user]User is already exist.");
			next(null, "User is already exist.");
		} else {
			user = new Users ({
				userName: name,
				password: encrypt(pass)
			});
			user.save(function (e) {
				log.debug ("[Controllers.user]Create User.");
				next(null, "Create User.");
			});
		}
	});
};

function encrypt (str) {
	var sha1sum = crypto.createHash('sha1');
	var crypted = sha1sum.update(str).digest('hex');
	return crypted;
}