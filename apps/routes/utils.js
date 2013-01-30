var auth, init, initJSON;

module.exports = {
		useJSON: function(req, res, next) {
			res.locals = {
				err: null,
				reload: null,
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
				res.locals.set({auth: false}).send();
			}
		}
}
