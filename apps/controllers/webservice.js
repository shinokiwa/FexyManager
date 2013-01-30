var express = require('express');
var http = require('http');
var path = require('path');
var routes = require('../routes');
var log = require('../controllers').log;
var app = express();

module.exports.start = function () {
	app.configure(function() {
		app.set('port', process.env.PORT || 80);
		app.set('views', path.join(__dirname, '../views'));
		app.set('view engine', 'jade');
		app.use(express.favicon());
		app.use(express.logger({"stream": log.access}));
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.cookieParser('your secret here'));
		app.use(express.session());
		app.use(app.router);
		app.use(require('stylus').middleware(path.join(__dirname, '../public')));
		app.use(express["static"](path.join(__dirname, '../public')));
	});

	app.configure('development', function() {
		return app.use(express.errorHandler());
	});

	routes(app);

	http.createServer(app).listen(app.get('port'), function() {
		log.debug ("[WebService]Express server listening on port " + (app.get('port')));
	});
}
