var r = require('../apps/if/fs/upstream');
r.upload(function(err, msg, data) {
	console.log(msg);
	process.exit(0);
});
