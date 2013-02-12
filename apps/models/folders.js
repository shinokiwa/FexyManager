var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;
var models = require('./index');
var fs = require('fs');
var path = require('path');
var configs = models.configs;

FilesSchema = new Schema({
	name : {
		type : String,
		required : true
	},
	type : {
		type : String
	}
}, {
	_id : false
});

FoldersSchema = new Schema({
	name : {
		type : String,
		index : {
			unique : true
		}
	},
	files : [ FilesSchema ],
	createdUser : String,
	createdDate : {
		type: Date,
		"default": Date.now
	},
	updatedUser : String,
	updatedDate : {
		type: Date,
		"default": Date.now
	}
}, {
	_id : false
});

FoldersSchema.virtual('path').get(function() {
	if (this.name == null) {
		return false;
	} else {
		var block = models.blocks(this.name);
		return path.join(block.path, this.name);
	}
});

FoldersSchema.virtual('info').get(function() {
	return this.path ? path.join(this.path, configs.folders.info) : false;
});

FoldersSchema.method({
	exists : function() {
		return fs.existsSync(this.path);
	},
	make : function() {
		if (!this.exists()) {
			models.blocks(this.name).make();
			fs.mkdirSync(this.path);
			fs.chmodSync(this.path, 0x1ff);
		}
	},
	sync : function() {
		if (fs.existsSync(this.path)) {
			if (fs.existsSync(this.info)) {
				infoStrings = fs.readFileSync(this.info, configs.encode);
				try {
					var infoJSON = JSON.parse(infoStrings);
					for ( var i in infoJSON) {
						this.set(i, infoJSON[i]);
					}
				} catch (err) {
				}
			}
			this.files = [];
			var files = fs.readdirSync(this.path);
			for ( var i = 0; i < files.length; i++) {
				if (files[i] !== configs.folders.info) {
					this.files.push (new Files ({name: files[i]}));
				}
			}
			this.files.sort(fSort);
		}
		return this;
	}
});

FoldersSchema.pre('save', function(next) {
	this.make();
	var infoJSON = JSON.stringify(this.toJSON());
	fs.writeFile(this.info, infoJSON, configs.encode, function() {
		if (typeof next === "function") next();
	});
});

FoldersSchema.pre('remove', function(next) {
	if (this.exists()) {
		if (this.info.exists()) {
			fs.unlinkSync(this.info.path);
		}
		fs.rmdirSync(this.path);
	}
	typeof next === "function" ? next() : void 0;
});

Files = mongoose.model('Files', FilesSchema);

Folders = mongoose.model('Folders', FoldersSchema);

var f = function(name, next) {
	Folders.findOne ({name: name}, function (err,data) {
		if (data) {
			next (data);
		} else {
			var folder = new Folders({
				name : path.basename(name)
			});
			next (folder.sync());
		}
	});
};

var fSort = function(a, b) {
	if (a.name > b.name) {
		return 1;
	}
	if (a.name < b.name) {
		return -1;
	}
	return 0;
};

module.exports = f;
module.exports.schema = Folders;
