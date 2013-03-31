var fs = require('../../../if/folder');
var path = require('path');
var d = require('domain').create();

module.exports.search = function(utils) {
	return [utils.useJSON, utils.auth, function(req, res) {
		fs.find ({}, function(err, msg, data) {
			console.log ('find send');
			res.locals.set({
				err: err,
				message: msg,
				data: data
			}).send();
		});
	}];
};

module.exports.get = function(utils) {
	return [utils.useJSON, utils.auth, d.bind(function(req, res) {
		d.on ('error', function (e) {utils.error(req, res, e);});
		fs.get (req.body.name, function(err, msg, data) {
			res.locals.set({
				err: err,
				message: msg,
				data: data
			}).send();
		});
	})];
};

module.exports.sync = function(utils) {
	return [utils.useJSON, utils.auth, function(req, res) {
		fs.sync (req.body.name, function(err, msg, data) {
			var e = null;
			if (err) {
				if (err.code == "ENOENT") {
					e = 'This folder already removed.';
				}
			}
			res.locals.set({
				err: e,
				message: msg,
				data: data
			}).send();
		});
	}];
};

module.exports.view = function(utils) {
	return [utils.useJSON, utils.auth, function(req, res) {
		fs.view (req.params.folder,req.params.file, function(err, msg, data) {
			if (data) {
				res.sendfile(data);
			}else {
				res.status(404).locals.set({
					err: err,
					message: msg,
					data: data
				}).send();
			}
		});
	}];
};

module.exports.remove = function(utils) {
	return [utils.useJSON, utils.auth, function(req, res) {
		fs.remove (req.body.name, function(err, msg, data) {
			res.locals.set({
				err: err,
				message: 'Removed Folder : '+req.body.name,
				data: data
			}).send();
		});
	}];
};