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
	resource.toFolder(pf.getPath(name), function(err, msg, folder) {
		if (err && err.code == "ENOENT") {
			folder.remove(function() {
				callback(err, msg, {});
			});
		} else {
			filetype(folder.files[0]).thumbnail(function (tm, ts) {
				folder.thumbnail_m = tm;
				folder.thumbnail_s = ts;
				folder.save(function() {
					callback(null, msg, folder);
				});
			});
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
		resource.toFolder(file, function(err, msg, data) {
			filetype(data.files[0]).thumbnail(function (tm, ts) {
				data.thumbnail_m = tm;
				data.thumbnail_s = ts;
				data.save(function(err, data) {
					if (err) {
						console.log (err);
					}
					next();
				});
			});
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
		resource.toFolder(path, function(err, msg, data) {
			filetype(data.files[0]).thumbnail(function (tm, ts) {
				data.thumbnail_m = tm;
				data.thumbnail_s = ts;
				data.save(function(err, data) {
					if (err) {
						console.log(err);
					}
					next();
				});
			});
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
