###
フォルダ情報操作DBモデル
物理フォルダ、論理フォルダ双方を管理する。
@author shinokiwa
###

mongoose = require 'mongoose'
Schema = mongoose.Schema
ObjectId = mongoose.Types.ObjectId
log =require '../log'

configs = require './configs'
fs = require 'fs'
path = require 'path'
__ = require '../i18n'
async = require 'async'
resources = require './resources'

FilesSchema = new Schema
	name: { type: String, required: true }
	type: { type: String }
,{_id:false}

FoldersSchema = new Schema
	name: { type: String, index: {unique: true} }
	files: [FilesSchema]
	createdUser: String
	createdDate: Date
	updatedUser: String
	updatedDate: Date
,{_id:false}

# フォルダのフルパス
FoldersSchema.virtual('path').get ->
	return path.join @block.path, @name

# 区画ブロック
# 自動判定のみなのでsetはない
FoldersSchema.virtual('block').get ->
	if !@_block?
		block = @name.substring 0,1
		if block is "."
			block = "[dot]"
		@_block = new resources (path.join configs.folders.fexy, block)
	return @_block

# 指定パス
FoldersSchema.virtual('src').set (v) ->
	@name = path.basename v
	@_src = new resources (v)
FoldersSchema.virtual('src').get () ->
	if !@_src?
		@_src = new resources (@path)
	return @_src

# Fexy管理パス
FoldersSchema.virtual('target').set (v) ->
	@_target = new resources (v)
FoldersSchema.virtual('target').get () ->
	if !@_target?
		@_target = new resources (@path)
	return @_target

# オリジナルパス指定

###
スキーマメソッドの定義
###
FoldersSchema.method {
}

###
middlewareの定義
###
###
ドキュメント保存時、フォルダが存在していない場合は作成する。
srcPathが存在している場合はそれを移動する。
###
FoldersSchema.pre 'save', (next)->
	@files.sort fSort
	@block.make()
	if @src.exists()
		if @src.isDirectory()
			@src.move @path
		else
			@target.make()
			@src.move path.join @path, @name
	@src = @path
	infoJSON = JSON.stringify @toJSON()
	fs.writeFile @src.info.path, infoJSON, configs.encode, -> next?()

###
論理フォルダ削除時は物理フォルダも削除する
infoファイルがある場合、一緒に削除される
###
FoldersSchema.pre 'remove', (next)->
	@src.remove()
	if @block.count() < 1
		@block.remove()
	next?()

Files = mongoose.model 'Files', FilesSchema
Folders = mongoose.model 'Folders', FoldersSchema


###
 以下、Foldersモデル自体のメソッド
###

###
新しい論理フォルダのインスタンスを生成する
@param String srcPath
@return bool
###
Folders.newFolder = (srcPath) ->
	folder = new Folders {src: srcPath}
	# infoファイルを読み込む
	if folder.src.info.exists()
		infoStrings = fs.readFileSync folder.src.info.path, configs.encode
		try
			infoJSON = JSON.parse infoStrings
		catch err
			infoJSON = {}
		for key, value in infoJSON
			folder.set key,value
	# ファイル一覧を作成
	if folder.src.exists()
		folder.files = []
		if folder.src.isDirectory()
			fileList = fs.readdirSync folder.src.path
			for fileName in fileList
				if fileName is configs.folders.info then continue
				file = new Files {
					name: fileName
					type: path.extname fileName
				}
				folder.files.push file
		else
			file = new Files {
				name: folder.name
				type: path.extname folder.name
			}
			folder.files.push file
		folder.files.sort fSort
	return folder

###
物理フォルダすべてに対して処理を行う。
区画直下にあるファイルや空フォルダはついでに処理する
###
Folders.physicalFolders = (fn, next) ->
	Folders.blockFolders (blockPath, nextFn)->
		Folders.processFolders blockPath, fn, nextFn
	, next

###
区画フォルダすべてに対して処理を行う。
直下にあるファイルや空フォルダはついでに処理する
###
Folders.blockFolders = (fn, next) ->
	Folders.processFolders configs.folders.fexy, fn, next

###
指定したフォルダ配下に対してすべて処理を行う
###
Folders.processFolders = (parentPath, fn, next) ->
	tasks = []
	fs.readdir parentPath, (err, folders)->
		for folder in folders
			folderPath = path.join parentPath, folder
			tasks.push Folders.processFolder folderPath, fn
		async.parallel tasks, (err, results) ->
			next?(null, results)

###
フォルダに処理を行う
基本的に内部処理用
###
Folders.processFolder = (folderPath, fn) ->
	return (next) ->
		if fs.statSync(folderPath).isFile()
			streamPath = path.join configs.folders.upstream, block
			log "[Folders.physicalFolders]Moving file on fexy : #{folderPath} : #{streamPath}"
			fs.rename blockPath, streamPath, next?()
		else
			folder = Folders.newFolder folderPath
			if folder.count < 1
				log "[Folders.physicalFolders]Removing physical folder : #{folderPath}"
				folder.remove next
			else
				fn folderPath, next

###
ファイル一覧を名前順に並べる
###
fSort = (a, b) ->
	if a.name > b.name then return 1
	if a.name < b.name then return -1
	return 0

module.exports = Folders
