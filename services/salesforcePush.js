var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var mongoose = require('mongoose')
var logger = require('../utils/logger')
var SalesforceClient = require('./salesforceClient')
const salesforceVerticals = require('../models/helpers/salesforceVerticals')
const verticals = require('../models/helpers/verticals')
var Company = keystoneShell.list('Company')
var Monetize = keystoneShell.list('Monetize').model
var PartnerProduct = keystoneShell.list('PartnerProduct')

var client = new SalesforceClient()

var pushCompanies = async function () {
	let connection = await mongoosePromise.connect()
	try {
		let companies = await Company.model.find().lean()
		await client.pushCompanies(companies)
		connection.close()
	} catch (error) {
		logger.error(error)
		connection.close()
		return error
	}
}

var pushProducts = async function () {
	let productsStatus = 'ok'
	let connection = await mongoosePromise.connect()
	try {
		for (let vertical in salesforceVerticals) {
			let status = await salesforceProductFactory(vertical)  // eslint-disable-line babel/no-await-in-loop
			if (status !== 'ok') {
				productsStatus = status
			}
		}
		if (productsStatus !== 'ok') {
			logger(`Error in salesforce product push ${status}`)
		}
		connection.close()
	} catch(error) {
		logger.error(error)
		connection.close()
		return error
	}
}

var salesforceProductFactory = async function (vertical) {
	const { collection, findClause, specificClause, salesforceVertical } = salesforceVerticals[vertical]
	let ProductVertical = keystoneShell.list(collection)
  let products = await (ProductVertical.model.find(specificClause || findClause).populate('company product').lean())

	for (var i = 0; i < products.length; i++) {
		if (vertical == 'Home Loans' && !products[i].isDiscontinued && products[i].product.isDiscontinued) {
			products[i].isDiscontinued = products[i].product.isDiscontinued
		}
		products[i].applyUrl = null
		products[i].goToSite = false
		let monetize = await (Monetize.findOne({ product: mongoose.Types.ObjectId(products[i]._id) }).lean()) // eslint-disable-line babel/no-await-in-loop
		if (monetize) {
			products[i].applyUrl = monetize.applyUrl
			products[i].goToSite = monetize.enabled
		}
  }

  let partnerProducts = await addPartnerProducts(vertical, products)
  if (partnerProducts.length > 0 ) {
    products.push(...partnerProducts)
  }
  let productsStatus = await (client.pushProducts(salesforceVertical, products))

  return productsStatus
}

async function addPartnerProducts (vertical, products) {
  let records = []
  let verticalValue = verticals.find((record) => record.label === vertical).value
  let partnerproducts = await PartnerProduct.model.find(
     { vertical: verticalValue, isBlacklisted: false, isPhantomProduct: false },
    ).lean()
  if (partnerproducts) {
    partnerproducts.forEach((pp) => {
      let product = products.find((record) => { return record.uuid === pp.parentUuid })
      if (product) {
        records.push({
          uuid: pp.uuid,
          company: { uuid: product.company.uuid },
          name: pp.name,
          isDiscontinued: product.isDiscontinued ? pp.isDiscontinued : false,
          goToSite: pp.isMonetized,
          applyUrl: pp.gotoSiteUrl,
        })
      }
    })
  }

  return records
}

module.exports = {
	pushCompanies: pushCompanies,
	pushProducts: pushProducts,
	salesforceProductFactory: salesforceProductFactory,
}
