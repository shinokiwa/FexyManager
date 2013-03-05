var mongoose = require('mongoose');
var configs = require ('../configs');
var log = require ('../log');

log.debug("[models]Connect to mongoDB. : "+ configs.dbs.connection);
mongoose.connect(configs.dbs.connection);

module.exports = mongoose;