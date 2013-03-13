var defaultType = require ('./defaultType');
var image = require ('./image');

var mime = {
	"image/jpg": image,
	"image/jpeg": image,
	"image/png": image,
	"image/gif": image
};

module.exports = function (file) {
	if (file && mime[file.type]) {
		return mime[file.type](file);
	} else {
		return new defaultType ();
	}
};
