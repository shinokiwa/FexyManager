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

var syncAll_onProcess = false;

module.exports.syncAll = function(start, complete) {
	var _complete = function(err, result) {
		complete(null, "Complete the synchronization process all folders.");
		syncAll_onProcess = false;
	};

	var logicalList = new Array ();
	
	var _removeLogical = function () {
		var logical = logicalList.shift();
		if (logical) {
			if (!pf.existsSync(pf.getPath(logical.name))) {
				console.log ('Remove logical folder no exists. : ' + logical.name);
				logical.remove();
			}
			setTimeout (arguments.callee, 0);
		} else {
			_complete();
		}
	};
	
	var _toFolder = function(path, next) {
		console.log ('Convert to folder from ' + path);
		resource(path, function(err, msg, data) {
			next();
		});
	};

	var folderList = new Array();

	var _syncFolders = function() {
		var folder = folderList.shift();
		if (folder) {
			_toFolder (folder, arguments.callee);
		} else {
			Folders.find({}, function (err, data) {
				for (var i=0;i<data.length;i++) {
					logicalList.push(data[i]);
				}
				_removeLogical();
			});
		}
	};

	var blockList = new Array();

	var _readBlock = function(err, block, stat) {
		if (stat) {
			if (stat.isDirectory() && pf.getBlock(block) == block) {
				console.log('Read block : ' + block);
				pf.getAllByBlock(block, function(err, data) {
					if (data.length == 0) {
						console.log ('Delete empty block : ' + block);
						pf.rmDir (pf.path(configs.folders.root, block));
					} else {
						data.forEach (function (v) {
							folderList.push (pf.path(configs.folders.root, block, v));
						});
					}
				});
			} else {
				console.log('Invalid block : ' + block);
				_toFolder(pf.path(configs.folders.root, block), _blockFilter);
			}
		}
		setTimeout(_blockFilter, 0);
	};

	var _blockFilter = function() {
		var block = blockList.shift();
		if (block) {
			pf.exStat(pf.path(configs.folders.root, block), function(err, stat) {
				_readBlock(err, block, stat);
			});
		} else {
			_syncFolders();
		}
	};

	if (syncAll_onProcess) {
		start(null, 'Another synchronization process is already running.', null);
		complete(null, null, null);
	} else {
		syncAll_onProcess = true;
		start(null, 'Start the synchronization process all folders.', null);
		pf.getAllBlocks(function(err, data) {
			blockList = data;
			setTimeout(_blockFilter, 0);
		});
	}
};

var remove = module.exports.remove = function(name, callback) {
	var path = pf.getPath(name);
	Folders.remove({
		name : name
	}, function(err) {
		pf.unlink(pf.path(path, configs.folders.info), function(err) {
			pf.rmDirR(path, function(err) {
				callback(err, null, null);
			});
		});
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
