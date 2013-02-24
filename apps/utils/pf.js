var fs = require('fs');
var path = require('path');
var async = require('async');

module.exports.processAll = function(root, filter, callback) {
	fs.readdir(root, function(err, folders) {
		async.filter(folders, filter, function(data) {
			if (typeof callback === "function")
				callback(null, data);
		});
	});
};

module.exports.path = function () {
	return path.join.apply (path, arguments);
};

module.exports.getBlock = function (name) {
	return name.match(/[^. \/]/)[0];
};