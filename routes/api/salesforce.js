var keystone = require('keystone');
import SalesforceClient from '../../services/salesforceClient';

var Company = keystone.list('Company');
var PersonalLoan = keystone.list('PersonalLoan');
var Monetize = keystone.list('Monetize');

exports.push = async function (req, res) {
  let client = new SalesforceClient();
//  res.status(200).jsonp({ text: client.pushCompanies([{uuid: '1111', name: 'Ian'}]) });
  let companyPromise = Company.model.find()
  .where('uuid', 'a4ad63ee-6a44-48f7-8cc4-aa12022af748')
  .lean()
  .exec()
  .then(async function (companies) {
    let companiesStatus = await client.pushCompanies(companies);
    console.log('after async');
    console.log(companiesStatus);
    res.jsonp({ text: companiesStatus });
  });
  let personalPromise = await salesforceProductFactory('Personal Loans', 'IsPersonalLoan', client);
  let carPromise = await salesforceProductFactory('Car Loans', 'IsCarLoan', client);
  Promise.all(companyPromise, personalPromise, carPromise).then(() => {

  });
};

var salesforceProductFactory = async function (vertical, loanType, client) {
  PersonalLoan.model.find()
  .where(loanType: true)
  .lean()
  .exec()
  .then(async function (products) {
    for (var i = 0; i < products.length; i++) {
      products[i].applyUrl = null;
      products[i].enabled = false;
      let monetize = Monetize.model.findOne({ id: products[i].product })
      .exec(function (err, variation) {
        if (monetize) {
          products[i].applyUrl = monetize.applyUrl;
          products[i].goToSite = monetize.enabled;
        }
      });
    }
    return products;
  })
  .then(async function (products) {
    let productsStatus = await client.pushProduct(vertical, products);
  })
}
