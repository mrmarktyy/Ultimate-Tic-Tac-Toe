var keystone = require('keystone')
var ApiKeyService = require('../services/ApiKeyService')
var middleware = require('./middleware')
var importRoutes = keystone.importer(__dirname)

// Common Middleware
keystone.pre('routes', middleware.initLocals)
keystone.pre('render', middleware.flashMessages)

// Import Route Controllers
var routes = {
  views: importRoutes('./views'),
  api: importRoutes('./api'),
}

function checkAPIKey (req, res, next) {
  let promise = ApiKeyService.isApiKeyValid(req.headers.apikey)
  promise.then((isApiKeyValid) => {
    if (isApiKeyValid != null) return next()
    return res.status(403).json({ error: 'no access' })
  })
}

// Setup Route Bindings
exports = module.exports = function (app) {
  app.all('/api*', checkAPIKey)

  // Views
  app.get('/', routes.views.index)

  // APIs
  // salesforce turn on and off products
  app.post('/api/v1/salesforce/product_monetize', keystone.middleware.api, routes.api.salesforceActivation.monetize)
  app.post('/api/v1/salesforce/push_companies', keystone.middleware.api, routes.api.salesforce.pushCompanies)
  app.post('/api/v1/salesforce/push_products', keystone.middleware.api, routes.api.salesforce.pushProducts)

  // Company
  app.get('/api/companies', keystone.middleware.api, routes.api.companies.list)

  // Home Loan
  app.get('/api/homeloans', keystone.middleware.api, routes.api.homeloans.list)
  app.get('/api/homeloans/extra', keystone.middleware.api, routes.api.homeloans.listWIthExtraData)

  // Personal Loan
  app.get('/api/personalloans', keystone.middleware.api, routes.api.personalloans.list)
  app.get('/api/personalloans/:id', keystone.middleware.api, routes.api.personalloans.one)

  // Featured Product
  app.get('/api/featured-products', keystone.middleware.api, routes.api.featuredProducts.list)

  app.get('/api/reporting', keystone.middleware.api, routes.api.reporting.json)
  app.get('/api/reporting.json', keystone.middleware.api, routes.api.reporting.json)
  app.get('/api/reporting.csv', keystone.middleware.api, routes.api.reporting.csv)

  // Sale Event Product
  app.get('/api/sale-event-products', keystone.middleware.api, routes.api.saleEventProducts.list)

  app.get('/api/sale-event-leads', keystone.middleware.api, routes.api.leads.json)
  app.get('/api/sale-event-leads.json', keystone.middleware.api, routes.api.leads.json)
  app.get('/api/sale-event-leads.csv', keystone.middleware.api, routes.api.leads.csv)

  // Specials
  app.get('/api/specials', keystone.middleware.api, routes.api.specials.list)
}
