var defaultType = require ('./defaultType');
var image = require ('./image');

var mime = {
	"image/jpg": image,
	"image/jpeg": image,
	"image/png": image,
	"image/gif": image
};

module.exports = function (folder, fileNum) {
	var file = folder.files[fileNum];
	if (file && mime[file.type]) {
		return mime[file.type](folder, fileNum);
	} else {
		return new defaultType (folder, fileNum);
	}
};
