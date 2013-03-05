var home = require('./home');
var upstream = require('./upstream');
var syncAll = require('./syncAll');
var folder = require('./folder');
var user = require('./user');
var utils = require('./utils');

module.exports = function(app) {
	app.get('/', home.index());
	app.all('/upstream', upstream.index(utils));
	app.all('/syncAll', syncAll.index(utils));
	app.post('/folder/search.json', folder.search(utils));
	app.post('/folder/get.json', folder.get(utils));
	app.post('/folder/sync.json', folder.sync(utils));
	app.get('/folder/view/:folder/:file', folder.view(utils));
	app.post('/user/login.json', user.login(utils));
	app.get('/user/logout', user.logout(utils));
};
