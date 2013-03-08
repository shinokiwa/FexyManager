var pf = require('./pf');
var resource = require('./resource');
var configs = require('../../configs');
var folders = require('./schemas/foldersSchema');

module.exports.sync = function(callback) {
	var _complete = function(err, result) {
		callback(null, "Complete sync all folders.");
	};
	
	var _toFolder = function (path, next) {
		resource.toFolder(path, function(err, msg, data) {
			data.save(function(err, data) {
				if (err) {
					console.log(err);
				}
				next();
			});
		});
	};
	
	var _blockFilter = function (block, next) {
		var blockName = pf.baseName(block);
		pf.exStat(block, function(err, stat) {
			if (stat.isDirectory() && pf.getBlock(blockName) == blockName) {
				pf.processAll(block, _toFolder, next);
			} else {
				_toFolder(block, next);
			}
		});
	};

	var _root = function (err) {
		pf.processAll(configs.folders.root, _blockFilter, _complete);
	};
	
	folders.remove({}, _root);
};
