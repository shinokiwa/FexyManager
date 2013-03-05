var Folders = require('./schemas/foldersSchema');
var pf = require('./pf');
var info = require('./info');

var f = module.exports = {
	find : function(conditions, callback) {
		Folders.find(conditions, function(err, data) {
			if (typeof callback === "function")
				callback(err, null, data);
		});
	},
	get : function(name, next) {
		Folders.findOne({
			name : name
		}, function(err, data) {
			if (typeof next === "function")
				next(err, null, data);
		});
	},
	sync : function(name, callback) {
		info.read(name, function(errInfo, msgInfo, data) {
			f.get (name, function (errGet, msgGet, folder) {
				if (errGet) {
					callback (errGet, msgGet, folder);
				} else if (errInfo && errInfo.code=="ENOENT") {
					folder.remove (function () {
						callback (errInfo, msgInfo || msgGet, {});
					});
				} else {
					folder.set (data).save(function () {
						callback (null, msgInfo || msgGet, folder);
					});
				}
			});
		});
	},
	view : function(folderName, fileName, next) {
		f.get(folderName, function(err, msg, data) {
			var ret = null;
			if (data) {
				for ( var i = 0; i < data.files.length; i++) {
					file = data.files[i];
					if (file.name === fileName) {
						ret = path.join(data.path, file.name);
						break;
					}
				}

			}
			if (typeof next === "function")
				next(null, null, ret);
		});
	},
	path : function(folderName) {
		return pf.getPath(folderName);
	}
};
