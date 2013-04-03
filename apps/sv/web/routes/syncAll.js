var fs = require('../../../if/folder');
var path = require('path');

module.exports.index = function(utils) {
	return [ utils.useJSON, utils.auth, function(req, res) {
		res.set('cache-control', 'no-cache');
		fs.syncAll(function(err, msg, data) {
			res.locals.set({
				err : err,
				message : msg,
				data : data
			}).send();
		}, function(err, msg, data) {
		});
	} ];
};