/**
 * Resources controller
 */
var pf = require('./pf');
var info = require('./info');
var folders = require ('./schemas/foldersSchema');
var filesSchema = require ('./schemas/filesSchema');
var fileType = require ('./filetype');
var configs = require ('../../configs');
var mime = require ('mime');

var resource = module.exports = function (path, callback) {
	var _err = function (code) {
		var e = new Error (code);
		e.code = code;
		e.path = path;
		callback (e, null, null);
	};
	
	var _save = function (folder, folderInfo) {
		if (folder) {
			folder.set (folderInfo);
		} else {
			folder = new folders (folderInfo);
		}
		folder.save (function (err, data) {
			callback (err, null, data);
			fileType(data.files[0]).thumbnail(data.name, data.files[0]);
		});
	};

	var _read = function (baseName, folderPath) {
		info.read(baseName, function (err,msg,folderInfo) {
			pf.exReadDir(folderPath, function (err, files) {
				if (err) {
					_err(err.message);
				} else {
					var list = new listObject ();
					for ( var i = 0; i < files.length; i++) {
						list.push (files[i]);
					}
					for ( var i = 0; i < folderInfo.files.length; i++) {
						list.update (folderInfo.files[i].path);
					}
					folderInfo.files = list.toArray();
					folders.findOne ({name: folderInfo.name}, function (err, folder) {
						_save (folder, folderInfo);
					});
				}
			});
		});
	};
	
	var _rename = function (folderPath,baseName,stat) {
		var dstPath;
		if (stat.isFile()) {
			dstPath = pf.path (folderPath, baseName);
		} else {
			dstPath = folderPath;
		}
		pf.rename(path, dstPath, function(err) {
			_read (baseName, folderPath);
		});
	};

	var _init = function (err, stat) {
		if (stat) {
			var baseName = pf.baseName(path);
			var folderPath = pf.getPath(baseName);
			if (folderPath == path) {
				_read (baseName, folderPath);
			} else {
				if (pf.existsSync(folderPath)) {
					var i = 0;
					do {
						i++;
						var dirName = pf.dirName (folderPath);
						var extName = pf.extName (folderPath);
						baseName = pf.baseName (folderPath, extName) + ' (' + i + ')';
						if (extName) baseName = baseName + extName;
						var newPath = pf.path (dirName, baseName);
					} while (pf.existsSync(newPath));
					folderPath = newPath;
				}
				pf.exmkDir (folderPath, function (err) {
					_rename (folderPath, baseName, stat);
				});
			}
		} else {
			_err ('ENOENT');
		}
	};
	
	pf.exStat (path, _init);
};

var listObject = function () {
	this._list = {};
	this.push = function (filePath) {
		this._list[filePath] = new filesSchema ({
			name: pf.baseName (filePath),
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
		var arr = new Array();
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
