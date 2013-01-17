require './users'

mongoose = require 'mongoose'
module.exports.init = ->
	console.log "Connect to mongoDB."
	mongoose.connect 'mongodb://localhost/fexy'
