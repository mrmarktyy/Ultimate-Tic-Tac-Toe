var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
  api: importRoutes('./api')
};

function checkAPIKey(req, res, next) {
  console.log(JSON.stringify(req.headers))
  if (req.headers['apikey'] == "1234567890") return next();
  return res.status(403).json({ 'error': 'no access' });
}

// Setup Route Bindings
exports = module.exports = function (app) {

  app.all('/api*', checkAPIKey);

  // Views
	app.get('/', routes.views.index);

  // APIs

  // Company
  app.get('/api/companies', keystone.middleware.api, routes.api.companies.list);

  // Personal Loan
  app.get('/api/personalloans', keystone.middleware.api, routes.api.personalloans.list);
  app.get('/api/personalloans/:id', keystone.middleware.api, routes.api.personalloans.one);

};
