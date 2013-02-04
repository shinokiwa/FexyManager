var path = require ('path');
var fs = require ('fs');
var exec = require ('child_process').exec;
var configs = require ('./conf/fexy.conf.js');
var d = require ('domain').create();

d.on ('error', function (e) {
	require ('./apps/controllers/log').fatal ("[Uncaught Exception]", e.message, e.stack);
	process.stdout.write ("[Uncaught Exception]"+e.message+"\n"+e.stack);
	process.stdout.write ("\n");
	process.exit(1);
});

function complete (e, msg) {
	process.stdout.write (msg);
	process.stdout.write ("\n");
	process.exit(0);
}

d.run (function () {
	process.umask(0);
	var c = {
		start: function () {
			require ('./apps/controllers/webservice').start()
		},
		sync: function () {
			
		},
		"create-user": function () {
			require ('./apps/controllers/user').create(process.argv[3], process.argv[4], complete)
		},
		"upstream": function () {
			require ('./apps/controllers/upstream').upload(complete);
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
