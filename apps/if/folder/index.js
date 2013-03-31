var Folders = require('./schemas/foldersSchema');
var pf = require('./pf');
var resource = require('./resource');
var configs = require('../../configs');
var filetype = require('./filetype');

process.umask(0);

var find = module.exports.find = function(conditions, callback) {
	Folders.find(conditions, function(err, data) {
		if (typeof callback === "function")
			callback(err, null, data);
	});
};

var get = module.exports.get = function(name, next) {
	Folders.findOne({
		name : name
	}, function(err, data) {
		if (typeof next === "function")
			next(err, null, data);
	});
};

var sync = module.exports.sync = function(name, callback) {
	resource(pf.getPath(name), function(err, msg, folder) {
		if (err && err.code == "ENOENT") {
			folder.remove(function() {
				callback(err, msg, {});
			});
		} else {
			callback(null, msg, folder);
		}
	});
};

var view = module.exports.view = function(folderName, fileName, next) {
	get(folderName, function(err, msg, data) {
		var ret = null;
		if (data) {
			for ( var i = 0; i < data.files.length; i++) {
				file = data.files[i];
				if (file.name === fileName) {
					ret = pf.path(pf.getPath(data.name), file.name);
					break;
				}
			}

		}
		if (typeof next === "function")
			next(null, null, ret);
	});
};

var upstream = module.exports.upstream = function(callback) {
	pf.processAll(configs.folders.upstream, function(file, next) {
		resource(file, function(err, msg, data) {
			next();
		});
	}, function(err, data) {
		callback(null, "Complete upload folders in Upstream.");
	});
};

module.exports.syncAll = function(callback) {
	var _complete = function(err, result) {
		callback(null, "Complete sync all folders.");
	};
	
	var _toFolder = function (path, next) {
		resource(path, function(err, msg, data) {
			next();
		});
	};
	
	var _blockFilter = function (block, next) {
		var blockName = pf.baseName(block);
		pf.exStat(block, function(err, stat) {
			if (stat.isDirectory() && pf.getBlock(blockName) == blockName) {
				pf.processAll(block, _toFolder, next);
			} else {
				_toFolder(block, next);
			}
		});
	};

	var _root = function (err) {
		pf.processAll(configs.folders.root, _blockFilter, _complete);
	};
	
	Folders.remove({}, _root);
};

var remove = module.exports.remove = function (name, callback) {
	var path = pf.getPath(name);
	Folders.remove({
		name : name
	}, function(err) {
		pf.unlink (pf.path(path, configs.folders.info), function (err) {
			pf.rmDirR (path, function (err) {
				callback(err, null, null);
			});
		});
	});
};
