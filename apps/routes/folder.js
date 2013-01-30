var c = require('../controllers');
var m = require('../models');
var path = require('path');

module.exports.search = function(utils) {
	return [utils.useJSON, utils.auth,
		function(req, res) {
			req.session.folders = {};
			return Folders.find({}, {
				name: 1
			}, function(e, data) {
				req.session.folders = data;
				res.locals.json.count = data.length;
				return res.json(res.locals.json);
			});
		}]
}

module.exports.getOne = function(req, res) {
  if (!(req.query.f != null)) {
    req.query.f = 0;
  }
  if (req.session.folders != null) {
    if (req.session.folders[req.query.f] != null) {
      res.locals.json.folder = req.session.folders[req.query.f];
    } else {
      res.locals.json.folder = {};
    }
  }
  return res.json(res.locals.json);
};

module.exports.get = function(req, res) {
  return Folders.find({
    name: req.query.name
  }, function(e, data) {
    if (data.length > 0) {
      res.locals.json.folder = data[0];
      return res.json(res.locals.json);
    } else {
      return res.send(404);
    }
  });
};

module.exports.view = function(req, res) {
  return Folders.find({
    name: req.params.folder
  }, function(e, data) {
    var file, _i, _len, _ref;
    if (data.length === 1) {
      _ref = data[0].files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (file.name === req.params.file) {
          log(file);
          res.sendfile(path.join(data[0].path, file.name));
          return;
        }
      }
    }
    return res.send(404);
  });
};
