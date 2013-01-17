middleware = require './middleware'
home = require './home'
explore = require './explore'
folder = require './folder'
user = require './user'

module.exports = (app)->
	app.get '/', middleware(), home.index
	app.get '/info.json', middleware(true), home.info

	app.get '/explore', middleware(true), explore.index

	app.get '/folder/index.json', middleware(true), folder.index
	app.get '/folder/search.json', middleware(true), folder.search
	app.get '/folder/get.json',  middleware(true), folder.get
	app.get '/folder/getOne.json',  middleware(true), folder.getOne

	app.get '/folder/:folder/:file', middleware(true), folder.view

	app.post '/user/login.json', middleware(), user.login
	app.get '/user/logout', middleware(), user.logout