var f = require('../apps/if/folder/');
f.upstream(function(err, msg, data) {
	console.log(msg);
	process.exit(0);
});
