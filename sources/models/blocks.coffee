fs = require 'fs'
path = require 'path'
async = require 'async'
models = require './index'
log =require '../log'

module.exports = (name)->
	fullPath = path.join models.fexyroot.path, name
	if (fs.existsSync b.path)
		if (fs.statSync(b.path).isFile()) || ((name.length > 1) && (name isnt "[dot]"))
			streamPath = path.join models.configs.folders.upstream, name
			log "[Folders.physicalFolders]Moving file on fexy : #{fullPath} : #{streamPath}"
			fs.renameSync fullPath, streamPath
			return false

	if name is "[dot]"
		blockName = "."
	blockName = name.substring 0,1
	if blockName is "."
		name = "[dot]"

	b = {}
	b.path = path.join models.fexyroot.path, blockName
	
	b.exists = -> return fs.existsSync b.path
	b.count = ->
		if b.exists()
			return fs.readdirSync(b.path).length
		else
			return 0

	if b.count() < 1
		fs.unlinkSync b.path

	b.make = ->
		if !b.exists()
			oldMask = process.umask(0);
			fs.mkdirSync b.path
			fs.chmodSync b.path, 0o777
			process.umask(oldMask);

	b.folders = (fn, next) ->
		if b.exists()
			tasks = []
			fs.readdir b.path, (err, folders)->
				for folder in folders
					tasks.push prs folder, fn
				async.parallel tasks, (err, results) ->
					next?(null, results)

	return b

prs = (name, fn) ->
	return (next) ->
		folder = models.folders name
		if folder
			fn folder, next
		else
			next?()
