/**
 * Physical Folders Utilities
 * 
 * Wrappers and Extends 'path' and 'fs' module
 */
var fs = require('fs');
var pt = require('path');
var async = require('async');
var configs = require('../../configs');

module.exports.processAll = function(root, filter, callback) {
	fs.readdir(root, function(err, data) {
		var folders = new Array();
		for ( var i = 0; i < data.length; i++) {
			if (data[i] != '.' && data[i] != '..') {
				folders.push(pt.join(root, data[i]));
			}
		}
		async.filter(folders, filter, function(data) {
			if (typeof callback === "function")
				callback(null, data);
		});
	});
};

module.exports.path = function() {
	return pt.join.apply(pt, arguments);
};

var exists = module.exports.exists = function(name, callback) {
	fs.exists(getPath(name), callback);
};

var getBlock = module.exports.getBlock = function(name) {
	return name.match(/[^. \/]/)[0].toLowerCase();
};

var getPath = module.exports.getPath = function(name) {
	return pt.join(configs.folders.root, getBlock(name), name);
};

var exStat = module.exports.exStat = function(path, callback) {
	fs.exists(path, function(exists) {
		if (exists) {
			fs.stat(path, callback);
		} else {
			callback(null, false);
		}
	});
};

var baseName = module.exports.baseName = pt.basename;
var extName = module.exports.extName = pt.extname;
var dirName = module.exports.dirName = pt.dirname;

var exmkDir = module.exports.exmkDir = function(path, callback) {
	var _err = function() {
		var e = new Error('ECANTMAKEDIR');
		e.code = 'ECANTMAKEDIR';
		e.path = path;
		callback(e, null, null);
	};
	var parent = dirName(path);
	if (!parent || parent == '/') {
		_err();
	} else {
		fs.exists(parent, function(exists) {
			if (exists) {
				fs.mkdir(path, function(err) {
					if (err) {
						_err();
					} else {
						callback();
					}
				});
			} else {
				exmkDir(parent, function(err) {
					if (err) {
						_err();
					} else {
						exmkDir(path, function(err) {
							if (err) {
								_err();
							} else {
								callback();
							}
						});
					}
				});
			}
		});
	}
};

var exReadDir = module.exports.exReadDir = function (path, callback) {
	fs.readdir(path, function (err, data) {
		if (err) {
			console.log (err);
			callback (err, []);
		} else {
			var files = new Array();
			for (var i =0; i< data.length; i++) {
				if (data[i] !== configs.folders.info) {
					files.push (pt.join(path, data[i]));
				};
			}
			callback (null, files);
		}
	});
};

var rename = module.exports.rename = fs.rename;
var existsSync = module.exports.existsSync = fs.existsSync;