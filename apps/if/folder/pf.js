/**
 * Physical Folders Utilities
 * 
 * Wrappers and Extends 'path' and 'fs' module
 */
var fs = require('fs');
var pt = require('path');
var configs = require('../../configs');

module.exports.getAllBlocks = function(callback) {
	fs.readdir(configs.folders.root, callback);
};

module.exports.getAllByBlock = function(block, callback) {
	fs.readdir(pt.join(configs.folders.root, block), callback);
};

module.exports.getUpstreams = function(callback) {
	fs.readdir(configs.folders.upstream, callback);
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
	var files = new Array();
	var cnt = 0;
	
	var _callback = function () {
		if (--cnt <= 0) {
			callback (null, files);
		}
	};
	
	var _rec = function (file) {
		if (file == configs.folders.info) {
			_callback();
		} else {
			var _path = pt.join(path, file);
			files.push (_path);
			if (fs.statSync (_path).isDirectory()) {
				exReadDir (_path, function (err, data) {
					files = files.concat(data);
					_callback();
				});
			} else {
				_callback();
			}
		}
	};
	
	fs.readdir(path, function (err, data) {
		if (err || data.length == 0) {
			callback (err, files);
		} else {
			cnt = data.length;
			data.forEach (_rec);
		}
	});
};

var rename = module.exports.rename = fs.rename;
var existsSync = module.exports.existsSync = fs.existsSync;

var rmDir = module.exports.rmDir = fs.rmdir;
var rmDirR = module.exports.rmDirR = function(path, callback) {
	var cnt = 0;
	
	var _callback = function (err) {
		if (err) {
			console.log (err);
		}
		if (--cnt <= 0) {
			fs.rmdir (path, function (err) {
				callback (null, null, null);
			});
		}
	};
	
	var _unlink = function (file) {
		if (fs.statSync(file).isDirectory()) {
			fs.rmdir (file, _callback);
		} else {
			fs.unlink (file, _callback);
		}
	};
	
	exReadDir(path, function (err, data) {
		if (err || data.length == 0) {
			_callback ();
		} else {
			var files = data.sort().reverse();
			cnt = files.length;
			files.forEach (_unlink);
		}
	});
};

module.exports.unlink = fs.unlink;