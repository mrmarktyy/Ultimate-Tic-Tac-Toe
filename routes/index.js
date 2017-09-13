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
  import: importRoutes('./import'),
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
  app.all('/import*', middleware.requireUser)

  // Views
  app.get('/', routes.views.index)
  app.get('/import-rates', middleware.requireUser, routes.views.importRates)
  app.get('/monthly-clicks-export', middleware.requireUser, routes.views.monthlyClicks.screen)
  app.post('/monthly-clicks-download', middleware.requireUser, routes.views.monthlyClicks.download)
  app.post('/salesforce-push/company', middleware.requireUser, routes.views.salesforcePush.pushCompanies)
  app.post('/salesforce-push/product', middleware.requireUser, routes.views.salesforcePush.pushProducts)
  app.get('/salesforce-push', middleware.requireUser, routes.views.salesforcePush.screen)
  app.post('/import-ecpc/upload', middleware.requireUser, middleware.financeUser, routes.views.importEcpc.uploadCsv)
  app.get('/import-ecpc', middleware.requireUser, middleware.financeUser, routes.views.importEcpc.screen)
  //downloads
  app.post('/import/homeloan-download-rates', routes.import.homeloanRates.downloadCsv)
  app.post('/import/homeloan-upload-rates', routes.import.homeloanRates.uploadCsv)

  // APIs
  // salesforce turn on and off products
  app.post('/api/v1/salesforce/product_monetize', keystone.middleware.api, routes.api.salesforceActivation.monetize)

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

  //Brokers
  app.get('/api/brokers', keystone.middleware.api, routes.api.brokers.list)

	//GenericProducts
	app.get('/api/generic-products', keystone.middleware.api, routes.api.genericProducts.list)

  // Savings Account
  app.get('/api/savings-accounts', keystone.middleware.api, routes.api.savingsAccounts.list)

	// Sponsored Link
	app.get('/api/sponsored-link', keystone.middleware.api, routes.api.sponsoredLinks.list)

	// Promoted Products
	app.get('/api/promoted-products', keystone.middleware.api, routes.api.promotedProducts.list)
}
