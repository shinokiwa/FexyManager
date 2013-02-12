var fs = require('fs');
var path = require('path');
var async = require('async');
var models = require('./index');
var log = require('../controllers').log
var d = require('domain').create();

d.on('error', function(e) {
	log.fatal("[models.resources]:" + e.message);
});

var resources = function(src, next) {
	next({
		path : src,
		exists : function(next) {
			var r = this;
			fs.exists(this.path, function (exists){
				if(exists) next(r);
			});
		},
		isDirectory : function(dirNext, fileNext) {
			this.exists(function (r) {
				fs.stat(r.path, function(err,stats) {
					if (stats.isDirectory()) {
						dirNext(r);
					} else {
						fileNext(r);
					}
				});
			});
		},
		toFolders : function(next) {
			var r = this;
			this.exists(function () {
				var basename = path.basename(r.path);
				models.folders(basename, function (folder) {
					r.isDirectory(function (){
						models.blocks(basename).make();
						fs.rename(r.path, folder.path, function () {
							log.info('Resource '+ r.path + ' to folder '+folder.path);
							next (folder.sync());
						});
					}, function () {
						folder.make();
						fs.rename(r.path, path.join(folder.path, basename), function () {
							log.info('Resource '+ r.path + ' to folder '+folder.path);
							next (folder.sync());
						});
					});
				});
			})
		},
		toUpstream : function() {
			var r = this;
			if (this.exists()) {
				var basename = path.basename(r.path);
				fs.renameSync(r.path, path.join(models.upstream.path, basename));
				log.info('Resource '+ r.path + ' to Upstream.');
			}
			return this;
		}
	});
};

module.exports = resources;
