var pf = require('./pf');
var resource = require('./resource');
var configs = require('../../configs');

module.exports.upload = function(callback) {
	pf.processAll(configs.folders.upstream, function(file, next) {
		resource.toFolder(pf.path(configs.folders.upstream, file), function(err, msg, data) {
			data.save(function(err, data) {
				if (err) {
					console.log (err);
				}
				next();
			});
		});
	}, function(err, data) {
		callback(null, "Complete upload folders in Upstream.");
	});
};
