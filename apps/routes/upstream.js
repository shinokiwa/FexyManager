var c = require('../controllers').upstream;
var path = require('path');

module.exports.index = function(utils) {
	return [utils.useJSON, utils.auth, function(req, res) {
		res.set('cache-control', 'no-cache');
		c.upload (function(err, msg, data) {
			res.locals.set({
				err: err,
				message: msg,
				data: data
			}).send();
		});
	}];
}