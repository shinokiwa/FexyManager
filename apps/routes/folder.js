var c = require('../controllers').folder;
var path = require('path');
var d = require('domain').create();

module.exports.search = function(utils) {
	return [utils.useJSON, utils.auth, function(req, res) {
		c.search ({}, function(err, msg, data) {
			res.locals.set({
				err: err,
				message: msg,
				data: data
			}).send();
		});
	}];
}

module.exports.get = function(utils) {
	return [utils.useJSON, utils.auth, d.bind(function(req, res) {
		d.on ('error', function (e) {utils.error(req, res, e);});
		c.get (req.body.name, function(err, msg, data) {
			res.locals.set({
				err: err,
				message: msg,
				data: data
			}).send();
		});
	})];
}

module.exports.sync = function(utils) {
	return [utils.useJSON, utils.auth, function(req, res) {
		c.sync (req.body.name, function(err, msg, data) {
			res.locals.set({
				err: err,
				message: msg,
				data: data
			}).send();
		});
	}];
}

module.exports.view = function(utils) {
	return [utils.useJSON, utils.auth, function(req, res) {
		c.view (req.params.folder,req.params.file, function(err, msg, data) {
			if (data == null) {
				res.locals.set({
					err: err,
					message: msg,
					data: data
				}).send();
			} else {
				res.sendfile(data);
			}
		});
	}];
}