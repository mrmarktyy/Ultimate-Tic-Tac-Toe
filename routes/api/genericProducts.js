var keystone = require('keystone')
var _ = require('lodash')
var GenericProduct = keystone.list('GenericProduct')
var CompanyService = require('../../services/CompanyService')
var monetizedCollection = require('./monetizedCollection')
var genericVerticals = require('../../models/helpers/genericVerticals')
var removeUneededFields = require('../../utils/removeUneededFields')

exports.list = async function (req, res) {
	const monetizedCollectionRequest = []
	for(var key in genericVerticals) {
		monetizedCollectionRequest.push(monetizedCollection(key))
	}
	const monetizeGenericProducts = (await Promise.all(monetizedCollectionRequest))
		.reduce((seed, product) => _.merge(seed, product), {})

	const genericProducts = await GenericProduct.model.find().populate('company').lean().exec()
	const enrichedProducts = genericProducts.map((product) => {
		product.promotedOrder = product.promotedOrder === '0' ? 0 : 100 - parseInt(product.promotedOrder)
		let monetize = monetizeGenericProducts[product._id]
		product.gotoSiteUrl = monetize ? monetize.applyUrl : null
		product.gotoSiteEnabled = monetize ? monetize.enabled : false
		product.paymentType = monetize ? monetize.paymentType : null
		product.company = removeUneededFields(CompanyService.fixLogoUrl(product.company))
		return removeUneededFields(product)
	})
	res.jsonp(enrichedProducts)
}

