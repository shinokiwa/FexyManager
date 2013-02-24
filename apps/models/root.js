var configs = require('../configs');
var utils = require('../utils');
var blocks = require('./blocks');

/**
 * m.root.blocks(function (err, data) { data.toFolders(...); });
 */

module.exports = {
	path : configs.folders.root,
	blocks : function(filter, callback) {
		utils.pf.processAll(this.path, function(b, next) {
			blocks(b, function(err, b) {
				filter(b, next);
			});
		}, callback);
	}
};
