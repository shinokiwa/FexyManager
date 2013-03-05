/**
 * .info.json file controller
 */
var pf = require ('./pf');
var configs = require ('../../configs');
var fs = require ('fs');
var filesSchema = require ('./schemas/filesSchema');

function fSort (a, b) {
	if (a.name > b.name) {
		return 1;
	}
	if (a.name < b.name) {
		return -1;
	}
	return 0;
};

function getFiles (folderPath, info, callback) {
	info.files = [];
	fs.readdir(folderPath, function (err, files) {
		if (!err) {
			for ( var i = 0; i < files.length; i++) {
				if (files[i] !== configs.folders.info) {
					info.files.push (new filesSchema ({name: files[i]}));
				}
			}
			info.files.sort(fSort);
		}
		callback (err, null, info);
	});
};

var read = module.exports.read = function (name, callback) {
	var folderPath = pf.getPath(name);
	var infoPath = pf.path(folderPath, configs.folders.info);
	var info = {name: name};
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
				getFiles (folderPath, info, callback);
			});
		} else {
			getFiles (folderPath, info, callback);
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
