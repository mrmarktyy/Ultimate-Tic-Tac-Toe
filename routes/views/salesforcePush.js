'use strict'
const keystone = require('keystone')
const salesforceProductFactory = require('../../services/salesforcePush').salesforceProductFactory
var SalesforceClient = require('../../services/salesforceClient')
const salesforceVerticals = require('../../models/helpers/salesforceVerticals')

var Company = keystone.list('Company')
var client = new SalesforceClient()

exports.screen = (req, res) => {
  console.log('starting screen')
  var view = new keystone.View(req, res)
  var locals = res.locals

  locals.section = 'home'
  console.log('starting screen 2')
  view.render('salesforcePush')
}

exports.pushCompanies = async (req, res) => {
  let companies = await Company.model.find().lean()
  client.pushCompanies(companies)
  req.flash('success', 'Company push has been activated')
  res.redirect('/salesforce-push')
}

exports.pushProducts = async (req, res) => {
  let productsStatus = 'ok'
  for (let vertical in salesforceVerticals) {
    console.log('vertical')
    salesforceProductFactory(vertical)  // eslint-disable-line babel/no-await-in-loop
  }
  req.flash('success', 'Product push has been activated')
  res.redirect('/salesforce-push')
}
