require('./models').init()

Folders = require './models/folders'
__ = require './i18n'
configs = require './models/configs'
fs = require 'fs'
path = require 'path'
log =require './log'
async = require 'async'

start = ->
	log "[explore]#{__('Start Process Explore.')}"
	updateLogicalFolders()

# 物理フォルダに対して、論理フォルダを正規化する
updateLogicalFolders=->
	log "[explore]Updating logical folders from physical folders."
	Folders.physicalFolders (folderPath, next) ->
		folder = Folders.newFolder folderPath
		folder.save()
		next?()
	,removeLogicalFolders()

# 論理フォルダを検索し、物理フォルダが存在しないものがある場合、削除する
removeLogicalFolders=->
	log "[explore]Removing logical folders have not physical folder."
	Folders.find {}, (e, data) ->
		tasks = []
		for folder in data
			tasks.push removeLogicalFolder folder
		async.parallel tasks, (err, results) ->
			createFolderByUpstreamDirs()

removeLogicalFolder = (folder) ->
	return (next) ->
		if !folder.src.exists()
			log "[explore]Remove logical folder : #{folder._id} #{folder.path}"
			folder.remove next
		else
			if folder.src.count() > 0
				next?()
			else
				folder.remove next

# アップストリームフォルダを検索し、ディレクトリがあればそのディレクトリ名でフォルダを作成する
createFolderByUpstreamDirs=->
	log "[explore]Creating folders by upstream directories."
	streamList = new Array
	streamPath = configs.folders.upstream
	searchFoldersByUpstreamDirs streamList, streamPath
	registFoldersByUpstreamDirs streamList, 0, createFolderByUpstreamFiles

# アップストリーム内の最下層フォルダにたどり着くまで再帰探索する
searchFoldersByUpstreamDirs=(streamList, dirPath)->
	log "[explore]Search folders by upstream dir. : #{dirPath}"
	dirList = fs.readdirSync dirPath
	for childDir in dirList
		childDirPath = path.join dirPath, childDir
		if fs.statSync(childDirPath).isDirectory()
			searchFoldersByUpstreamDirs streamList, childDirPath
			streamList.push childDirPath

# アップストリーム内のフォルダを登録する
registFoldersByUpstreamDirs = (streamList, i, next) ->
	if streamList[i]?
		log "[explore]Regist folders by upstream dir. : #{streamList[i]}"
		folder = Folders.newFolder streamList[i]
		folder.save ->
			registFoldersByUpstreamDirs streamList, ++i, next
	else
		next?()

# アップストリームフォルダを検索し、直下にファイルがあればフォルダを作成する
createFolderByUpstreamFiles=->
	log "[explore]Creating folders by upstream files."
	streamPath = configs.folders.upstream
	fileList = fs.readdirSync streamPath
	cnt = 0
	if fileList.length > 0
		for file in fileList
			filePath = path.join streamPath, file
			if fs.statSync(filePath).isFile()
				folder = Folders.newFolder filePath
				log "[explore]Regist folders by upstream dir. : #{filePath} : #{folder.path}"
				folder.save () ->
					cnt++
					if cnt >= fileList.length then finish()
			else
				cnt++
				if cnt >= fileList.length then finish()
	else
		finish()

# 最終処理として、空の論理フォルダを削除する
finish= ->
	Folders.remove {files: {$size: 0}}, (e,data)->
		log "[explore]#{__('All Process Completed.')}"
		process.exit()

start()
