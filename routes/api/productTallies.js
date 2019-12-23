const keystone = require('keystone')
var verticals = require('../../models/helpers/salesforceVerticals')

exports.list = async function (req, res) {
  let obj = {}
  verticals['Home Loans'] = { collection: 'ProviderProductName', salesforceVertical: 'Home Loans' } //use the providerproductname for homeloans
  for (let vertical in verticals) {
    let count = await productCount(vertical)
    if (count) {
      obj[vertical] = count
    }
  }
  res.jsonp(obj)
}

async function productCount (vertical) {
  const { collection, findClause } = verticals[vertical]
  let ProductVertical = keystone.list(collection)
  let specificClause = {...findClause, ...{ $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] }}
  delete specificClause['company'] //remove salesforce specific logic
  let count = await (ProductVertical.model.count(specificClause))
  return count
}
