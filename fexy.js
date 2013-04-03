var configs = require ('./apps/configs');
var d = require ('domain').create();

d.on ('error', function (e) {
	require ('./apps/log').fatal ("[Uncaught Exception]", e.message, e.stack);
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
			require('./apps/sv/web').start(function (err, msg) {
				if (msg) process.stdout.write (msg + "\n");
			});
		},
		'sync-all': function () {
			require ('./apps/if/folder').syncAll(function (err, msg) {
				if (msg) process.stdout.write (msg + "\n");
			}, function (err,msg) {
				if (msg) process.stdout.write (msg + "\n");
				process.exit(0);
			});
		},
		"create-user": function () {
			controllers.user.create(process.argv[3], process.argv[4], complete);
		},
		"upstream": function () {
			controllers.upstream.upload(complete);
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
