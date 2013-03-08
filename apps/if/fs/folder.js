var Folders = require('./schemas/foldersSchema');
var pf = require('./pf');
var resource = require('./resource');

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
		resource.toFolder(name, function(err, msg, folder) {
			if (err && err.code == "ENOENT") {
				folder.remove(function() {
					callback(err, msg, {});
				});
			} else {
				folder.save(function() {
					callback(null, msg, folder);
				});
			}
		});
	},
	view : function(folderName, fileName, next) {
		f.get(folderName, function(err, msg, data) {
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
	},
	path : function(folderName) {
		return pf.getPath(folderName);
	}
};
