fs = require 'fs'
path = require 'path'
async = require 'async'
models = require './index'

r = {}
r.path = models.configs.folder.fexy

r.blocks = (fn, next) ->
	tasks = []
	fs.readdir r.path, (err, folders)->
		for folder in folders
			tasks.push prs folder, fn
		async.parallel tasks, (err, results) ->
			next?(null, results)

prs = (name, fn) ->
	return (next) ->
		block = models.blocks name
		if block
			fn block, next
		else
			next?()

module.exports = r