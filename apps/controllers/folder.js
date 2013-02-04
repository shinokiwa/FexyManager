var folders = require('../models').folders.schema;
var path = require('path');

var f = {
	search : function(conditions, next) {
		folders.find(conditions, function(err, data) {
			if (typeof next === "function")
				next(err, null, data);
		});
	},
	sync : function(name, next) {
		f.get(name, function(err, msg, data) {
			if (data) {
				data.sync().save(function(err, result) {
					if (typeof next === "function")
						next(err, null, data);
				});
			} else {
				if (typeof next === "function")
					next(err, null, data);
			}
		});
	},
	get : function(name, next) {
		folders.find({
			name : name
		}, function(err, data) {
			if (typeof next === "function")
				next(err, null, data[0]);
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
					}
				}
			}
			if (typeof next === "function")
				next(null, null, ret);
		});
	}
}

module.exports = f
