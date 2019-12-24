const keystone = require('keystone')
var verticals = require('../../models/helpers/salesforceVerticals')

var rateData = {
  'Home Loans': {rate: 'rate', collection: 'HomeLoanVariation', subClause: {isDiscontinued: false}},
  'Car Loans': {rate: 'minRate', collection: 'PersonalLoanVariation'},
  'Personal Loans': {rate: 'minRate', collection: 'PersonalLoanVariation'},
  'Credit Cards': {rate: 'purchaseRateStandard', collection: 'CreditCard', noProduct: true},
  'Superannuation': {rate: '5_year_annualised_performance', collection: 'Superannuation', noProduct: true},
  'Pension': {rate: '5_year_annualised_performance', collection: 'Superannuation', noProduct: true},
  'Savings Accounts': {rate: 'baseRate', collection: 'SavingsAccountTier'},
  'Term Deposits': {rate: 'interestRate', collection: 'TermDepositTier'},
  'Bank Accounts': {rate: 'maximumInterestRate', collection: 'BankAccount', noProduct: true},
}

exports.list = async function (req, res) {
  let obj = {}
  verticals['Home Loans'] = { collection: 'ProviderProductName', salesforceVertical: 'Home Loans' } //use the providerproductname for homeloans
  for (let vertical in verticals) {
    let count = await productCount(vertical)
    if (verticals[vertical]['collection'] !== 'GenericProduct') {
      let rates = await productRates(vertical)
      obj[vertical] = {count: count, ...rates}
    } else {
      obj[vertical] = {count: count}
    }
  }
  res.jsonp(obj)
}

async function productCount (vertical) {
  const { collection, findClause } = verticals[vertical]
  let ProductVertical = keystone.list(collection)
  let specificClause = {...findClause, ...{ $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] }}
  delete specificClause['company'] //remove salesforce specific logic
  let count = await ProductVertical.model.count(specificClause)
  return count
}

async function productRates (vertical) {
  const { findClause } = verticals[vertical]
  const { rate, collection, subClause = {}, noProduct= false} = rateData[vertical]
  let Variation = keystone.list(collection)
  let data = await Variation.model.find(subClause).populate('product').lean().exec()
  data = data.filter((record) => {
    let accepted = false
    if (noProduct) {
      accepted = record.isDiscontinued === false
    } else {
      accepted = record.product.isDiscontinued === false
    }
    if (accepted && findClause) {
      let key = Object.keys(findClause)[0]
      if (noProduct) {
        accepted = record[key] === findClause[key]
      } else {
        accepted = record.product[key] === findClause[key]
      }
    }
    return accepted
  })
  let minRecord = data.reduce((prev, curr) => prev[rate] < curr[rate] ? prev : curr)
  let maxRecord = data.reduce((prev, curr) => prev[rate] > curr[rate] ? prev : curr)
  return { minRate: minRecord[rate], maxRate: maxRecord[rate] }
}