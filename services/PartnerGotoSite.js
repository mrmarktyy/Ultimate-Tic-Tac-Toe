// node services/PartnerGotoSite.js
require('dotenv').config()
const keystone = require('keystone')
const PartnerProduct = keystone.list('PartnerProduct')

module.exports = async function (vertical) {
  var obj = {}
  await PartnerProduct.model.find({isPhantomProduct: false, isBlacklisted: false, vertical: vertical, isDiscontinued: false, isMonetized: true}).populate('partners')
  .lean()
  .exec((err, products) => {
    if (err) {
      logger.error(`database error on ${vertical} api fetching monetized events`)
      return 'database error'
    }
    products.forEach((product) => {
      obj[product.parentUuid] = product.partners.map((partner) => { return partner.name})
    })
  })
  return obj
}
