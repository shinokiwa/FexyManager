var db = require('../../db');
var Schema = db.Schema;
var ObjectId = db.Types.ObjectId;
var info = require('../info');
var FilesSchema = require ('./filesSchema');

FoldersSchema = new Schema({
	name : {
		type : String,
		index : {
			unique : true
		}
	},
	thumbnail_m: String,
	thumbnail_s: String,
	files : [ FilesSchema.schema ],
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

FoldersSchema.pre('save', function(next) {
	info.write(this, function () {
		if (typeof next === "function") next();
	});
});

var Folders = exports = module.exports = db.model('Folders', FoldersSchema);
