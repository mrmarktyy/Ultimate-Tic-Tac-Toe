var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var mongoose = require('mongoose')
var logger = require('../utils/logger')
var SalesforceClient = require('./salesforceClient')
var salesforceVerticals = require('../models/helpers/salesforceVerticals')
var Company = keystoneShell.list('Company')
var Monetize = keystoneShell.list('Monetize').model
var client = new SalesforceClient()

exports.pushCompanies = async function () {
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

exports.pushProducts = async function () {
  let productsStatus = 'ok'
  let connection = await mongoosePromise.connect()
  try {
    for (let vertical in salesforceVerticals) {
      let status = await salesforceProductFactory(vertical, loanTypeObject(vertical))  // eslint-disable-line babel/no-await-in-loop
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

var salesforceProductFactory = async function (vertical, loanTypeQuery) {
  let ProductVertical = keystoneShell.list(salesforceVerticals[vertical])
  let products = await (ProductVertical.model.find(loanTypeQuery).populate('company product').lean())

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
  let productsStatus = await (client.pushProducts(vertical, products))
  return productsStatus
}

var loanTypeObject = function (vertical) {
  let result
  switch (vertical) {
    case 'Personal Loans':
      result = { isPersonalLoan: 'YES' }
      break
    case 'Car Loans':
      result = { isCarLoan: 'YES' }
      break
    default:
      result = {}
  }
  return result
}
