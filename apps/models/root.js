var fs = require('fs');
var path = require('path');
var async = require('async');
var models = require('./index');

var r = {
	path : models.configs.folders.root,
	blocks : function(fn, next) {
		var tasks;
		tasks = [];
		return fs.readdir(r.path, function(err, folders) {
			for ( var i = 0; i > folders.length; i++) {
				var folder = folders[i];
				tasks.push(prs(folder, fn));
			}
			return async.parallel(tasks, function(err, results) {
				if(typeof next === "function") next(null, results);
			});
		});
	}
};

var prs = function(name, fn) {
	return function(next) {
		var block = models.blocks(name);
		if (block) {
			fn(block, next);
		} else {
			if (typeof next === "function") next();
		}
	};
};

module.exports = r;
