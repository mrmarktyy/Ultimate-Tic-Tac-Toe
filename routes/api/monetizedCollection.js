var keystone = require('keystone')
var Monetize = keystone.list('Monetize')
var logger = require('../../utils/logger')

module.exports = async function (vertical) {
  var obj = {}
  await Monetize.model.find({vertical: vertical, enabled: true})
  .lean()
  .exec((err, monetizes) => {
    if (err) {
      logger.error(`database error on ${vertical} api fetching monetized events`)
      return 'database error'
    }
    monetizes.forEach((record) => {
      obj[record.product] = record
    })
  })
  return obj
}
