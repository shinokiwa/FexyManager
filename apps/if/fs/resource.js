/**
 * Resources controller
 */
var pf = require('./pf');
var fs = require('fs');
var path = require('path');
var info = require('./info');
var folders = require ('./schemas/foldersSchema');

function makeFolder(fPath, callback) {
	var parent = path.dirname(fPath);
	if (parent == '/') {
		callback('err');
	} else {
		fs.exists(parent, function(exists) {
			if (exists) {
				fs.mkdir(fPath, function(err) {
					callback(err);
				});
			} else {
				makeFolder(parent, function (err) {
					makeFolder (fPath, function (err) {
						callback(err);
					});
				});
			}
		});
	}
}

function getUniquePath (rPath) {
	if (fs.existsSync(rPath)) {
		var i = 1;
		while (fs.existsSync(rPath + '(' + i + ')')) {
			i++;
		}
		if (i > 0) rPath = rPath + '(' + i + ')';
	}
	console.log ('getUniquePath', rPath);
	return rPath;
}

function readInfo (baseName, callback) {
	info.read(baseName, function (err,msg,data) {
		folders.findOne ({name: data.name}, function (err, f) {
			if (f) {
				f.set (data);
			} else {
				f = new folders (data);
			}
			callback (err, msg, f);
		});
	});
}

var toFolder = module.exports.toFolder = function(rPath, callback) {
	fs.exists(rPath, function(exists) {
		if (exists) {
			var baseName = path.basename(rPath);
			var fPath = pf.getPath(baseName);
			if (fPath == rPath) {
				readInfo (baseName, callback);
			} else {
				uPath = getUniquePath (fPath);
				makeFolder(uPath, function(err) {
					if (err) {
						console.log (err);
						process.exit(1);
					}
					fs.stat (rPath, function (err, stats) {
						if (stats.isFile()) {
							uPath = path.join (uPath, path.basename(uPath));
						}
						fs.rename(rPath, uPath, function(err) {
							if (err) {
								console.log (err);
								process.exit(1);
							}
							readInfo (path.basename(uPath), callback);
						});
					});
				});
			}

		}
	});
};

var toUpstream = module.exports.toUpstream = function(rPath, callback) {
	fs.exists(rPath, function() {
		var baseName = path.basename(rPath);
		var uPath = getUniquePath (path.join(configs.folders.upstream, baseName));
		fs.rename(rPath, uPath, function (err) {
			calback (err, null, null);
		});
	});
};
