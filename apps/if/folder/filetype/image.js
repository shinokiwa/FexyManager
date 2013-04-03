var defaultType = require('./defaultType');
var im = require('imagemagick');

module.exports = function(folder, fileNum) {
	var image = new defaultType(folder, fileNum);
	image.thumbnail = function(callback) {
		var create = function(size, nextFn) {
			im.resize({
				srcPath : image.folder.files[image.fileNum].path,
				height : size,
				width : size
			}, function(err, stdout, stderr) {
				if (err) {
					nextFn(err);
				} else {
					nextFn(null, stdout);
				}
			});
		};

		create(64, function(err, sData) {
			if (err) {
				callback (err);
			} else {
				create(140, function(err, mData) {
					if (err) {
					} else {
						image.folder.thumbnail_s = defaultType.toDataSchema(sData, image.folder.files[image.fileNum].type);
						image.folder.thumbnail_m = defaultType.toDataSchema(mData, image.folder.files[image.fileNum].type);
						callback (null, image.folder);
					}
				});
			}
		});

	};
	return image;
};