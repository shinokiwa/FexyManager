###
デバッグ用ログ出力
###
configs = require './models/configs'

if configs.debug
	module.exports = (str) ->
		console.log str
else
	module.exports = () ->
		null
	