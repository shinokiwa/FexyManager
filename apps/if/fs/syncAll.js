var pf = require('./pf');
var resource = require('./resource');
var configs = require('../../configs');
var fs = require ('fs');
var folders = require ('./schemas/foldersSchema');

function processFile (filePath, nextFile) {
	resource.toFolder(filePath, function(err, msg, data) {
		data.save(function(err, data) {
			if (err) {
				console.log (err);
			}
			nextFile();
		});
	});
}

module.exports.sync = function(callback) {
	folders.remove({}, function (err) {
		pf.processAll(configs.folders.root, function(block, nextBlock) {
			var blockPath = pf.path(configs.folders.root, block);
			fs.stat(blockPath, function (err, stat) {
				if (stat.isDirectory()) {
					if (pf.getBlock (block) == block ) {
						pf.processAll(blockPath, function(file, nextFile) {
							processFile (pf.path(blockPath, file), nextBlock);
						}, function () {
							nextBlock();
						});
					} else {
						processFile (blockPath, nextBlock);
					}
				} else {
					processFile (blockPath, nextBlock);
				}
			});
			
		}, function(err, data) {
			callback(null, "Complete sync all folders.");
		});
	});
};
