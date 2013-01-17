mongoose = require 'mongoose'

module.exports.init =->
	console.log "Connect to mongoDB."
	mongoose.connect 'mongodb://localhost/fexy'

module.exports.users = require './users'
module.exports.configs = require './configs'
module.exports.files = require './files'
module.exports.folders = require './folders'
module.exports.blocks = require './blocks'
module.exports.root = require './root'
