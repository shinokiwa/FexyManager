var configs = require('../models/configs');
var fs = require ('fs');

function write () {
	for (var i=0; i < arguments.length; i++) {
		fs.appendFileSync(configs.logs.path, arguments[i]+"\n");
	}
}

function dest () {}

module.exports.access = {
	write: function (log) {
		fs.appendFileSync(configs.logs.path, log);
	}
}
module.exports.debug = (configs.logs.level >= 4)?write:dest;
module.exports.fatal = (configs.logs.level >= 1)?write:dest;
