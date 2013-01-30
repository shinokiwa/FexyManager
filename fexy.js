var path = require ('path');
var fs = require ('fs');
var exec = require ('child_process').exec;
var configs = require ('./conf/fexy.conf.js');
var d = require ('domain').create();

d.on ('error', function (e) {
	require ('./apps/controllers/log').fatal ("[Uncaught Exception]", e.message, e.stack);
	process.exit(1);
});

d.run (function () {
	var c = {
		start: function () {
			require ('./apps/controllers/webservice').start()
		},
		sync: function () {
			
		},
		"create-user": function () {
			require ('./apps/controllers/user').create(process.argv[3], process.argv[4], function (e, msg) {
				process.stdout.write (msg);
				process.stdout.write ("\n");
				process.exit(0);
			});
		}
	};

	var command = process.argv[2];
	if (c[command] != undefined) {
		c[command]();
	} else {
		process.stdout.write ("Command "+ command +" is Not Found.\n");
		process.exit(1);
	}
});
