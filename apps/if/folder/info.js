/**
 * .info.json file controller
 */
var pf = require ('./pf');
var configs = require ('../../configs');
var fs = require ('fs');

var read = module.exports.read = function (name, callback) {
	var folderPath = pf.getPath(name);
	var infoPath = pf.path(folderPath, configs.folders.info);
	var info = {name: name, files:new Array()};
	fs.exists(infoPath, function (exists) {
		if (exists) {
			fs.readFile (infoPath, configs.encode, function (err, data) {
				if (!err) {
					try {
						info = JSON.parse(data);
						info.name = name;
					} catch (err) {
					}
				}
				callback (null, null, info);
			});
		} else {
			callback (null, null, info);
		}
	});
};

var write = module.exports.write = function (folder, callback) {
	var folderPath = pf.getPath(folder.name);
	var infoPath = pf.path(folderPath, configs.folders.info);
	var infoJSON = JSON.stringify(folder.toJSON());
	fs.writeFile(infoPath, infoJSON, configs.encode, function() {
		callback(null,null,infoJSON);
	});
};
