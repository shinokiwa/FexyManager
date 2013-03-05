var auth = require('../../../if/auth');

module.exports.login = function (utils) {
	return [utils.useJSON, function(req, res) {
		res.set('cache-control', 'no-cache');
		if (req.body.username && req.body.password) {
			auth.login (req.body.username, req.body.password, function(err, msg, data) {
				req.session.user = data;
				if (data.auth) res.locals.reload = true;
				res.locals.set({
					err: err,
					message: msg,
					auth: data.auth,
				}).send();
			});
		} else {
			res.locals.set({
				message: "Input ID and Password.",
				auth: false
			}).send();
		}
	}];
};
module.exports.logout = function (utils) {
	return [utils.useJSON, function(req, res) {
		req.session.user = {};
		res.locals.set({
			reload: true
		}).send();
	}];
};
