/**
 * Resources controller
 */
var pf = require('./pf');
var fs = require('fs');
var path = require('path');
var info = require('./info');
var folders = require ('./schemas/foldersSchema');
var filesSchema = require ('./schemas/filesSchema');
var configs = require ('../../configs');
var mime = require ('mime');

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
			filelist (f, callback);
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
				var uPath = getUniquePath (fPath);
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
								console.log (err.code, rPath, uPath);
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

var listObject = function () {
	this._list = {};
	this.push = function (filePath) {
		this._list[filePath] = new filesSchema ({
			name: path.basename (filePath),
			path: filePath,
			type: mime.lookup(filePath)
		});
	};
	this.update = function (filePath) {
		if (this._list[filePath] !== undefined) {
			this.push(filePath);
		}
	};
	this.toArray = function (){
		var arr = [];
		for (var i in this._list) {
			arr.push(this._list[i]);
		}
		arr.sort(fSort);
		return arr;
	};
	
	return this;
};

function fSort (a, b) {
	if (a.name > b.name) {
		return 1;
	}
	if (a.name < b.name) {
		return -1;
	}
	return 0;
};

function filelist (folder, callback) {
	var folderPath = pf.getPath (folder.name);
	fs.readdir(folderPath, function (err, files) {
		var list = new listObject ();
		if (!err) {
			for ( var i = 0; i < files.length; i++) {
				if (files[i] !== configs.folders.info) {
					list.push (pf.path(folderPath, files[i]));
				};
			}
			for ( var i = 0; i < folder.files.length; i++) {
				if (folder.files[i].name !== configs.folders.info) {
					list.update (folder.files[i].path);
				};
			}
			folder.files = list.toArray();
		}
		callback (err, null, folder);
	});
};
