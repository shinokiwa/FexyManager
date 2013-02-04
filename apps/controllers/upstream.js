var upstream = require ('../models').upstream;

module.exports.upload = function(next) {
		upstream.resources(function(resources, nextFn){
			resources.toFolders().save();
			nextFn();
		}, function () {
			if(typeof next === "function") {
				next (null, "Complete upload folders in Upstream.");
			}
		});
	};
