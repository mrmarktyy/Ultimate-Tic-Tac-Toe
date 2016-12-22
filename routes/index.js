var keystone = require('keystone');
var ApiKeyService = require('../services/ApiKeyService');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
  views: importRoutes('./views'),
  api: importRoutes('./api'),
};

function checkAPIKey (req, res, next) {
  console.log(JSON.stringify(req.headers));
  let promise = ApiKeyService.isApiKeyValid(req.headers.apikey);
  promise.then(function (isApiKeyValid) {
    if (isApiKeyValid != null) return next();
    return res.status(403).json({ error: 'no access' });
  });
}

// Setup Route Bindings
exports = module.exports = function (app) {

  app.all('/api*', checkAPIKey);

  // Views
  app.get('/', routes.views.index);

  // APIs
  // salesforce turn on and off products
  app.post('/api/v1/salesforce/product_monetize', keystone.middleware.api, routes.api.salesforceActivation.monetize);
  app.post('/api/v1/salesforce/push_companies', keystone.middleware.api, routes.api.salesforce.pushCompanies);
  app.post('/api/v1/salesforce/push_products', keystone.middleware.api, routes.api.salesforce.pushProducts);

  // Company
  app.get('/api/companies', keystone.middleware.api, routes.api.companies.list);

  // Personal Loan
  app.get('/api/personalloans', keystone.middleware.api, routes.api.personalloans.list);
  app.get('/api/personalloans/:id', keystone.middleware.api, routes.api.personalloans.one);

  // Featured Product
  app.get('/api/featured-products', keystone.middleware.api, routes.api.featuredProducts.list);
};
