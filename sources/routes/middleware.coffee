init = (isAuth) ->
	ret = [initJSON]
	if isAuth
		ret.push auth
	ret


initJSON = (req, res, next) ->
	console.log "[routes.requestHandler]Start."
	res.locals.json = {}
	next()

auth = (req, res, next) ->
	if req.session.user? && req.session.user.auth? && req.session.user.auth
		res.locals.json.auth = true
		next()
	else
		res.locals.json.auth = false
		res.json res.locals.json

module.exports= init