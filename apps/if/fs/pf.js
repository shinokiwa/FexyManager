/**
 * Physical Folders Utilities
 */
var fs = require('fs');
var path = require('path');
var async = require('async');
var configs = require ('../../configs');

module.exports.processAll = function(root, filter, callback) {
	fs.readdir(root, function(err, data) {
		var folders = new Array();
		for (var i=0;i<data.length;i++) {
			if (data[i] != '.' && data[i] != '..') {
				folders.push (data[i]);
			}
		}
		async.filter(folders, filter, function(data) {
			if (typeof callback === "function")
				callback(null, data);
		});
	});
};

module.exports.path = function () {
	return path.join.apply (path, arguments);
};

var exists = module.exports.exists = function (name, callback) {
	fs.exists(getPath(name), callback);
};

var getBlock = module.exports.getBlock = function (name) {
	return name.match(/[^. \/]/)[0].toLowerCase();
};

var getPath = module.exports.getPath = function (name) {
	return path.join (configs.folders.root, getBlock(name), name);
};
