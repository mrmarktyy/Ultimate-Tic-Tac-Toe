var keystone = require('keystone');
import SalesforceClient from '../../services/salesforceClient';
import salesforceVerticals from '../../models/helpers/salesforceVerticals';
var Company = keystone.list('Company');
var mongoose = require('mongoose');
var Monetize = mongoose.model('Monetize');


var client = new SalesforceClient();

exports.pushCompanies = async function (req, res) {
  Company.model.find()
  .lean()
  .exec()
  .then(async function (companies) {
    let companiesStatus = await client.pushCompanies(companies);
    res.jsonp({ text: companiesStatus });
  });
};

exports.pushProducts = async function (req, res) {
  let promises = [];
  for (let vertical in salesforceVerticals) {
    promises.push(salesforceProductFactory(vertical, loanTypeObject(vertical)));
  }
  return Promise.all(promises).then((stati) => {
    let productsStatus = 'ok';
    if (stati.indexOf('errors') > 0) {
      productsStatus = 'errors';
    }
    console.log('finished');
    return res.jsonp({ text: productsStatus });
  });
};

var salesforceProductFactory = function (vertical, loanType) {
  let ProductVertical = keystone.list(salesforceVerticals[vertical]);

  return ProductVertical.model.find(loanType)
  .populate('company')
  .lean()
  .exec()
  .then(async function (products) {
    for (var i = 0; i < products.length; i++) {
      products[i].applyUrl = null;
      products[i].goToSite = false;
      let monetize = await Monetize.findOne({ id: products[i].product }).lean();
      if (monetize) {
        products[i].applyUrl = monetize.applyUrl;
        products[i].goToSite = monetize.enabled;
      }
    }
    return products;
  })
  .then(async function (products) {
    let productsStatus = await client.pushProducts(vertical, products);
    return productsStatus;
  });
};


var loanTypeObject = function (vertical) {
  let result;
  switch (vertical) {
    case 'Personal Loans':
      result = { isPersonalLoan: 'YES' };
      break;
    case 'Car Loans':
      result = { isCarLoan: 'YES' };
      break;
    default:
      result = {};
  }
  return result;
};

