var keystone = require('keystone')
var SalesforceClient = require('../../services/salesforceClient')
var salesforceVerticals = require('../../models/helpers/salesforceVerticals')
var Company = keystone.list('Company')
var mongoose = require('mongoose')
var Monetize = keystone.list('Monetize').model

var client = new SalesforceClient()

exports.pushCompanies = async function (req, res) {
  return res.status(200).jsonp(200)
}

exports.pushProducts = async function (req, res) {
  return res.status(200).jsonp(200)
}
