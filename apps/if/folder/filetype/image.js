var defaultType = require('./defaultType');
var im = require('imagemagick');
var fs = require('fs');

module.exports = function(file) {
	var image = new defaultType();
	image.thumbnail = function(callback) {
		im.resize({
			srcPath : file.path,
			height : 64,
			width : 64
		}, function(err, stdout, stderr) {
			if (err) {
				console.log(err);
				callback('', '');
			} else {
				var bytes = [];
				for ( var i = 0; i < stdout.length; i++)
					bytes[i] = stdout.charCodeAt(i) & 0xff;
				var ts = 'data:' + file.type + ';base64,' + (new Buffer(bytes).toString('base64'));
				callback('', ts);
			}
		});
	};
	return image;
};