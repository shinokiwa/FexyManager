var home = require('./home');
var explore = require('./explore');
var folder = require('./folder');
var user = require('./user');
var utils = require('./utils');

module.exports = function(app) {
	app.get('/', home.index());
//	app.get('/explore', explore.index());
//	app.get('/folder/index.json', folder.index());
	app.get('/folder/search.json', folder.search(utils));
//	app.get('/folder/get.json', folder.get());
//	app.get('/folder/getOne.json', folder.getOne());
//	app.get('/folder/:folder/:file', folder.view());
	app.post('/user/login.json', user.login(utils));
	app.get('/user/logout', user.logout(utils));
};
