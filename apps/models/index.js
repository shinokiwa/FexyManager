var mongoose = require('mongoose');
var configs = require ('./configs');
var log= require ('../controllers').log;

log.debug("[models]Connect to mongoDB. : "+ configs.dbs.connection);
mongoose.connect(configs.dbs.connection);
module.exports.configs = configs;

module.exports.users = require('./users');
// module.exports.files = require('./files');
module.exports.folders = require('./folders');
module.exports.blocks = require('./blocks');
module.exports.root = require('./root');
module.exports.upstream = require('./upstream');
module.exports.resources = require('./resources');
