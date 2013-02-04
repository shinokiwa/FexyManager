var fs = require('fs');
var path = require('path');
var async = require('async');
var models = require('./index');
var log = require('../controllers').log
var d = require('domain').create();

d.on('error', function(e) {
	log.fatal("[models.resources]:" + e.message);
});

var resources = function(src) {
	return {
		path : src,
		exists : function() {
			return fs.existsSync(this.path);
		},
		isDirectory : function() {
			if (this.exists()) {
				return fs.statSync(this.path).isDirectory();
			} else {
				return false;
			}
		},
		toFolders : function() {
			if (this.exists()) {
				var basename = path.basename(this.path);
				var folder = models.folders(basename);
				if (this.isDirectory()) {
					fs.renameSync(this.path, folder.path);
				} else {
					folder.make();
					fs.renameSync(this.path, path.join(folder.path, basename));
				}
				log.info('Resource '+ this.path + ' to folder '+folder.path);
				return folder;
			} else {
				return false;
			}
		},
		toUpstream : function() {
			if (this.exists()) {
				var basename = path.basename(this.path);
				fs.renameSync(this.path, path.join(models.upstream.path, basename));
				log.info('Resource '+ this.path + ' to Upstream.');
			}
			return this;
		}
	}
};

module.exports = resources;
