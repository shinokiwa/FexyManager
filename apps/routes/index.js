var home = require('./home');
var upstream = require('./upstream');
var folder = require('./folder');
var user = require('./user');
var utils = require('./utils');

module.exports = function(app) {
	app.get('/', home.index());
	app.get('/upstream', upstream.index(utils));
	app.post('/folder/search.json', folder.search(utils));
	app.get('/folder/get.json', folder.get(utils));
	app.get('/folder/sync.json', folder.sync(utils));
	app.get('/folder/view/:folder/:file', folder.view(utils));
	app.post('/user/login.json', user.login(utils));
	app.get('/user/logout', user.logout(utils));
};
