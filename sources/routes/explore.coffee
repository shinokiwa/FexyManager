__ = require '../i18n'
fork = require("child_process").fork

explore = 
	process: false

	index: (req, res) ->
		explore.start()
		res.locals.json.action = "reload"
		res.json res.locals.json

	start: ->
		if !explore.process
			cp = fork "#{__dirname}/../explore"
			cp.on "exit", ->
				explore.process = false
	
console.log "[routes.explore]Initial Exploring."
explore.start()

module.exports = explore