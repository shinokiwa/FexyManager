var m = require('./apps/models');
m.root.blocks(function(b, next1) {
	b.folders(function(f,next2) {
		console.log(f.path);
		next2();
	}, function (err, data) {
		next1();
	});
}, function(err, data) {
	console.log('complete');
	process.exit(0);
});
