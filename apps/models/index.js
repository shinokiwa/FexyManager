var mongoose = require('mongoose');
var configs = require ('./configs');
var log= require ('../controllers').log;
var d =require ('domain').create();

d.on('error', function (e) {
	log.fatal ("[models]Failed to connect mongoDB. : "+ e.message );
	process.exit (1);
});

d.run (function () {
	log.debug("[models]Connect to mongoDB. : "+ configs.dbs.connection);
	mongoose.connect(configs.dbs.connection);
	module.exports.configs = configs;
});

module.exports.users = require('./users');
// module.exports.files = require('./files');
module.exports.folders = require('./folders');
module.exports.blocks = require('./blocks');
module.exports.root = require('./root');
