const keystone = require('keystone')
const removeUneededFields = require('../../utils/removeUneededFields')

const ExternalApi = keystone.list('ExternalApi')

exports.list = async function (req, res) {
  const apis = await ExternalApi.model.find({}, { apiSecret: 0 }).lean().exec()
  res.jsonp(apis.map((api) => removeUneededFields(api)))
}
