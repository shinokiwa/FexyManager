var auth, init, initJSON;

var u = {
		useJSON: function(req, res, next) {
			res.locals = {
				err: null,
				auth: null,
				message: null,
				data: null,
				set: function (values) {
					for (i in values) {
						this[i] = values[i];
					}
					return this;
				},
				send: function () {
					res.json (res.locals);
					return this;
				}
			};
			next();
		},
		auth: function (req, res, next) {
			if ((req.session.user != null) && (req.session.user.auth != null) && req.session.user.auth) {
				res.locals.auth = true;
				next();
			} else {
				res.status(401).locals.set({auth: false}).send();
			}
		},
		error: function (req, res, e) {
			res.locals.set({err: e.message, data: e.stack}).send();
		}
}

module.exports = u;