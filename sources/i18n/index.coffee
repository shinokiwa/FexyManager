language = require './en'

module.exports = (string) ->
	if language[string]?
		return language[string]
	else
		string