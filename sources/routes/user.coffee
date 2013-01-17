Users = require '../models/users'

module.exports.login = (req, res)->
	console.log "[user.login]Start Login."
	res.set 'cache-control', 'no-cache'
	if req.body.username? && req.body.password
		Users.findUser req.body.username, req.body.password, (user) ->
			if user.length > 0
				console.log "[user.login]Login Success."
				req.session.user = {}
				req.session.user.auth = true
				res.json {auth:true, action: "reload"}
			else
				console.log "[user.login]Login Fail."
				res.json {auth: false}
	else
		res.json {auth: false}

module.exports.logout = (req, res)->
	console.log "Start Logout."
	req.session.user = {}
	res.redirect 302, '/'
