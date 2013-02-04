var fs = require('fs');
var path = require('path');
var async = require('async');
var models = require('./index');
var d = require('domain').create();

d.on('error', function(e) {
	require('../controllers/log').fatal("[model.blocks]", e.message, e.stack);
	return false;
});

blocks = function(name) {
	resource = models.resources(path.join(models.root.path, name));
	if (resource.exists()) {
		if (resource.isDirectory()) {
			if (name.length > 1) {
				resource.toUpstream();
			} else {
				if (fs.readdirSync(resource.path).length < 1) {
					resource.toUpstream();
				}
			}
		} else {
			resource.toUpstream();
		}
	}
	
	var blockName = name.match(/[^. \/]/)[0];

	var b = {
		path : path.join(models.root.path, blockName),
		exists : function() {
			return fs.existsSync(this.path);
		},
		count : function() {
			if (this.exists()) {
				return fs.readdirSync(this.path).length;
			} else {
				return 0;
			}
		},
		make : function() {
			if (!b.exists()) {
				fs.mkdirSync(b.path);
				fs.chmodSync(b.path, 0x1ff);
			}
		},
		folders : function(fn, next) {
			var tasks;
			if (b.exists()) {
				tasks = [];
				return fs.readdir(b.path, function(err, folders) {
					var folder, _i, _len;
					for (_i = 0, _len = folders.length; _i < _len; _i++) {
						folder = folders[_i];
						tasks.push(prs(folder, fn));
					}
					return async.parallel(tasks, function(err, results) {
						return typeof next === "function" ? next(null, results)
								: void 0;
					});
				});
			}
		}
	}

	return b;
};

prs = function(name, fn) {
	return function(next) {
		var folder;
		folder = models.folders(name);
		if (folder) {
			return fn(folder, next);
		} else {
			return typeof next === "function" ? next() : void 0;
		}
	};
};
module.exports = blocks;
