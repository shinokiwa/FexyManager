Folders = require '../models/folders'
path = require 'path'
log = require '../log'

module.exports.index = (req, res) ->
	Folders.find {}, (e, data) ->
		res.locals.json.folders = data
		res.json res.locals.json

module.exports.search = (req, res) ->
	req.session.folders = {}
	Folders.find {},{name:1}, (e, data) ->
		req.session.folders = data
		res.locals.json.count = data.length
		res.json res.locals.json

module.exports.getOne = (req, res) ->
	if !req.query.f? then req.query.f = 0
	if req.session.folders?
		if req.session.folders[req.query.f]?
			res.locals.json.folder = req.session.folders[req.query.f]
		else
			res.locals.json.folder = {}
	res.json res.locals.json

module.exports.get = (req, res) ->
	Folders.find {name: req.query.name}, (e, data) ->
		if data.length > 0
			res.locals.json.folder = data[0]
			res.json res.locals.json
		else
			res.send 404

module.exports.view = (req, res) ->
	Folders.find {name: req.params.folder}, (e, data) ->
		if data.length is 1
			for file in data[0].files
				if file.name is req.params.file
					log file
					res.sendfile path.join data[0].path, file.name
					return
		res.send 404
