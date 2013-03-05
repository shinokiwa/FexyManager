var fs = require('../../../if/fs');
var path = require('path');

module.exports.index = function(utils) {
	return [utils.useJSON, utils.auth, function(req, res) {
		res.set('cache-control', 'no-cache');
		fs.upstream.upload (function(err, msg, data) {
			res.locals.set({
				err: err,
				message: msg,
				data: data
			}).send();
		});
	}];
};