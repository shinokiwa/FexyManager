var fs = require('fs');
var path = require('path');
var async = require('async');
var models = require('./index');

var r = {};
r.path = models.configs.folders.root;
r.blocks = function(fn, next) {
  var tasks;
  tasks = [];
  return fs.readdir(r.path, function(err, folders) {
    var folder, _i, _len;
    for (_i = 0, _len = folders.length; _i < _len; _i++) {
      folder = folders[_i];
      tasks.push(prs(folder, fn));
    }
    return async.parallel(tasks, function(err, results) {
      return typeof next === "function" ? next(null, results) : void 0;
    });
  });
};

prs = function(name, fn) {
  return function(next) {
    var block;
    block = models.blocks(name);
    if (block) {
      return fn(block, next);
    } else {
      return typeof next === "function" ? next() : void 0;
    }
  };
};

module.exports = r;
