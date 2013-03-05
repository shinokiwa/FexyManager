var s = require('../apps/if/fs/syncAll');
s.sync(function(err, msg, data) {
	console.log(msg);
	process.exit(0);
});
