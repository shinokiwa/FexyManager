var fs = require('fs');
var path = require('path');
var async = require('async');
var models = require('./index');
var log = require('../controllers').log;
var d = require('domain').create();

d.on('error', function(e) {
	log.fatal("[models.resources]:" + e.message);
});

var u = {
	path : models.configs.folders.upstream,
	resources : function(fn, next) {
		var tasks = [];
		fs.readdir(u.path, function(err, folders) {
			for ( var i = 0; i < folders.length; i++) {
				var folder = folders[i];
				tasks.push(prs(folder, fn));
			}
			async.parallel(tasks, function(err, results) {
				if (typeof next === "function")
					next(null, results);
			});
		});
	}
};

var prs = function(name, fn) {
	return function(next) {
		var resource = models.resources(path.join(u.path, name));

		if (resource) {
			fn(resource, next);
		} else {
			if (typeof next === "function")
				next();
		}
	};
};

module.exports = u;
