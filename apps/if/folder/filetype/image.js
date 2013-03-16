var defaultType = require('./defaultType');
var im = require('imagemagick');
var fs = require('fs');
var folders = require('../schemas/foldersSchema');

module.exports = function() {
	var image = new defaultType();
	image.thumbnail = function(folderName, file) {
		var create = function(size, callback) {
			im.resize({
				srcPath : file.path,
				height : size,
				width : size
			}, function(err, stdout, stderr) {
				if (err) {
					console.log(err);
					callback('');
				} else {
					callback(stdout);
				}
			});
		};

		create(64, function(sData) {
			create(140, function(mData) {
				folders.update({
					name : folderName
				}, {
					thumbnail_s : defaultType.toDataSchema(sData, file.type),
					thumbnail_m : defaultType.toDataSchema(mData, file.type),
				}, function(err) {
					if (err)
						console.log(err);
				});
			});
		});

	};
	return image;
};