###
物理リソース処理モデル
@author shinokiwa
###
fs = require 'fs'
path = require 'path'

configs = require './configs'

resources = (src) ->
	@path = src

	# infoファイル
	@info = {
		path: path.join @path, configs.folders.info
		# 実在しているか
		exists: -> return fs.existsSync @path
	}

	# 実在しているか
	@exists = ->
		return fs.existsSync @path

	# 対象はディレクトリか
	@isDirectory = ->
		if @exists() then return fs.statSync(@path).isDirectory()
		else return false

	# ディレクトリ内のファイル数(システムファイルはカウントされない)
	# 論理フォルダ内のファイル数は.files.lengthで取得できる…はず。
	@count = ->
		if @exists()
			if @isDirectory()
				files = fs.readdirSync @path
				count = files.length
				if @info.exists() then count = count - 1
				return count
			else
				return 1
		else
			return 0

	# 対象のbasename

	# 対象ディレクトリが存在しない場合、作成する
	@make = ->
		if !@exists()
			oldMask = process.umask(0);
			fs.mkdirSync @path
			fs.chmodSync @path, 0o777
			process.umask(oldMask);

	# 対象を指定パスに移動する
	@move = (target) ->
		if @exists() && @path isnt target
			fs.renameSync @path, target

	# 対象を削除する
	# ファイルごと削除するので扱いは注意。
	@remove = ->
		if @exists()
			if @info.exists()
				fs.unlinkSync @info.path
			ret = fs.rmdirSync @path
	return @

module.exports = resources	