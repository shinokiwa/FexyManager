var df = module.exports = function(folder, fileNum) {
	this.folder = folder;
	this.fileNum = fileNum;

	this.thumbnail = function(callback) {
		callback(null, this.folder);
	};

	return this;
};

var toDataSchema = module.exports.toDataSchema = function(str, type) {
	var bytes = [];
	for ( var i = 0; i < str.length; i++)
		bytes[i] = str.charCodeAt(i) & 0xff;
	return 'data:' + type + ';base64,' + (new Buffer(bytes).toString('base64'));
};