var express = require('express');
var http = require('http');
var path = require('path');
var routes = require('../routes');
var log = require('../utils').log;
var models = require ('../models');
var app = express();

module.exports.start = function (next) {
	app.configure(function() {
		app.set('port', models.configs.webservice.listen || 80);
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

	routes(app);

	http.createServer(app).listen(app.get('port'), function() {
		next (null, "[WebService]Express server listening on port " + (app.get('port')));
	});
};
