var f = require('../apps/if/folder/');
f.remove('test', function(err, msg, data) {
	console.log(msg);
	process.exit(0);
});
