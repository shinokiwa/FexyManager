var im = require('imagemagick');
var fs = require ('fs');

im.resize({
	srcPath : '9.jpg',
	height: 64,
	width : 64
}, function(err, stdout, stderr) {
	if (err)
		throw err;
	console.log(new Buffer(stdout).toString('base64'));
});