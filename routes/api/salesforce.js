var keystone = require('keystone')
var SalesforceClient = require('../../services/salesforceClient')
var salesforceVerticals = require('../../models/helpers/salesforceVerticals')
var Company = keystone.list('Company')
var mongoose = require('mongoose')
var Monetize = mongoose.model('Monetize')

var client = new SalesforceClient()

exports.pushCompanies = async function (req, res) {
  let companies = await Company.model.find().lean()
  let companiesStatus = await client.pushCompanies(companies)
  res.jsonp({ text: companiesStatus })
}

exports.pushProducts = async function (req, res) {
  let productsStatus = 'ok'
  for (let vertical in salesforceVerticals) {
    let status = await salesforceProductFactory(vertical, loanTypeObject(vertical))  // eslint-disable-line babel/no-await-in-loop
    if (status !== 'ok') {
      productsStatus = status
    }
  }
  if (productsStatus === 'ok') {
    res.status(200)
  }
  return res.jsonp({ text: productsStatus })
}

var salesforceProductFactory = async function (vertical, loanTypeQuery) {
  let ProductVertical = keystone.list(salesforceVerticals[vertical])
  let products = await (ProductVertical.model.find(loanTypeQuery).populate('company').lean())

  for (var i = 0; i < products.length; i++) {
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
