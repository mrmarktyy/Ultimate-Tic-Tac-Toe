require('dotenv').config()

var keystoneShell = require('../utils/keystoneShell')
const ALLVERTICALS = require('../models/helpers/salesforceVerticals')
var _ = require('lodash')

module.exports = async function (query, sort = {}) {
  let collections = {}
  for (let vertical in ALLVERTICALS) {
    let {collection, findClause} = ALLVERTICALS[vertical]
    let model = await keystoneShell.list(collection).model // eslint-disable-line babel/no-await-in-loop
    findClause = _.merge({}, query, findClause || {})
    let products = await model.find(findClause).populate('company').sort(sort).lean().exec() // eslint-disable-line babel/no-await-in-loop
    if (products.length) {
      collections[vertical] = products
    }
  }
  return collections
}
