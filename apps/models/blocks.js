var fs = require('fs');
var models = require('./index');
var d = require('domain').create();
var utils = require('../utils');

d.on('error', function(e) {
	require('../utils').log.fatal("[model.blocks]", e.message, e.stack);
	return false;
});

module.exports = function(name, callback) {
	models.resources(utils.pf.path(models.root.path, name), function(resource) {
		resource.exists(function(r) {
			resource.isDirectory(function(resource) {
				if (name.length > 1 || fs.readdirSync(resource.path).length < 1) {
					resource.toUpstream();
				}
			}, function() {
				resource.toUpstream();
			});
		});
	});

	var blockName = utils.pf.getBlock(name);

	if (typeof callback === 'function') {
		callback(null, {
			path : utils.pf.path(models.root.path, blockName),
			exists : function(callback) {
				var r = this;
				fs.exists(this.path, function(exists) {
					if (exists)
						callback(r);
				});
			},
			make : function() {
				this.exists(function() {
					fs.mkdirSync(b.path);
					fs.chmodSync(b.path, 0x1ff);
				});
			},
			folders : function(filter, callback) {
				utils.pf.processAll(this.path, function(f, next) {

					models.folders(f, function(err, data) {
						filter(data, next);
					});
				}, callback);
			}
		});
	}
};
