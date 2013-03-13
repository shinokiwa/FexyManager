/**
 * Physical Folders Utilities
 */
var fs = require('fs');
var pt = require('path');
var async = require('async');
var configs = require ('../../configs');

module.exports.processAll = function(root, filter, callback) {
	fs.readdir(root, function(err, data) {
		var folders = new Array();
		for (var i=0;i<data.length;i++) {
			if (data[i] != '.' && data[i] != '..') {
				folders.push (pt.join(root, data[i]));
			}
		}
		async.filter(folders, filter, function(data) {
			if (typeof callback === "function")
				callback(null, data);
		});
	});
};

module.exports.path = function () {
	return pt.join.apply (pt, arguments);
};

var exists = module.exports.exists = function (name, callback) {
	fs.exists(getPath(name), callback);
};

var getBlock = module.exports.getBlock = function (name) {
	return name.match(/[^. \/]/)[0].toLowerCase();
};

var getPath = module.exports.getPath = function (name) {
	return pt.join (configs.folders.root, getBlock(name), name);
};

var exStat = module.exports.exStat = function (path, callback) {
	fs.stat (path, callback);
};

var baseName = module.exports.baseName = pt.basename;