explore = require './explore'

module.exports.index = (req, res) ->
	res.render 'index', { title: 'FexyManager' }

module.exports.info = (req, res) ->
	info = {auth: res.locals.auth}
	if explore.process then info.info = "Processing Explore. Please Wait."
	res.json info
