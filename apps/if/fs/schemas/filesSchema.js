var db = require('../../db');
var Schema = db.Schema;
var ObjectId = db.Types.ObjectId;
var configs = require ('../../../configs');

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

var Files = exports = module.exports = db.model('Files', FilesSchema);
