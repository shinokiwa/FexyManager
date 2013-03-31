var s = require('../apps/if/folder');
s.syncAll(function(err, msg, data) {
	console.log(msg);
	process.exit(0);
});
