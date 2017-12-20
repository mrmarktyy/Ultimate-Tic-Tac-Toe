'use strict'
const keystone = require('keystone')
const ALLVERTICALS = require('../../models/helpers/salesforceVerticals')
var _ = require('lodash')

exports.screen = (req, res) => {
  var view = new keystone.View(req, res)
  var locals = res.locals
  locals.section = 'home'
  view.render('uuidSearch')
}

exports.findUuid = async (req, res) => {
  let uuid = req.body.uuid
  let validUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (validUUID.test(uuid)) {
    let [record, verticalInfo] = await collectionSearch(uuid)
    return res.status(200).json({data: record, vertical: verticalInfo})
  } else {
    return res.status(200).json({data: {}, vertical: {flashmessage: 'UUID invalid format, no record found'}})
  }
}

async function collectionSearch (uuid) {
  let verticals = ALLVERTICALS
  verticals['Brokers'] = { collection: 'Broker' }
  verticals['Home Loans Product'] = { collection: 'HomeLoan' }
  verticals['Company'] = {collection: 'Company'}
  let data = {}
  let verticalInfo  = {flashmessage: 'no record found'}
  for (let vertical in verticals) {
    let {collection, findClause} = verticals[vertical]
    let model = await keystone.list(collection).model // eslint-disable-line babel/no-await-in-loop
    findClause = _.merge({}, {uuid: uuid}, findClause || {})
    let record = await model.findOne(findClause).lean().exec() || null // eslint-disable-line babel/no-await-in-loop
    if (record) {
      let {name, slug, _id} = record
      data = {
        vertical: vertical,
        _id: _id,
        name: name,
        slug: slug,
        url: `keystone/${keystone.lists[collection].path}/${_id}`,
      }
      verticalInfo = {
        flashmessage: `${vertical} record found`,
        flashcode: 'success',
      }
      break
    }
  }
  return [data, verticalInfo]
}
