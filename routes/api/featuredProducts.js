var keystone = require('keystone')

var FeaturedProduct = keystone.list('FeaturedProduct')
var logger = require('../../utils/logger')

exports.list = async function (req, res) {
  let datenow = new Date()
  let products = await FeaturedProduct.model.find(
    {
      $or: [
        { dateStart: { $lte: datenow }, enabled: true, dateEnd: null, sortOrder: { $ne: null } },
        { dateStart: { $lte: datenow }, enabled: true, dateEnd: { $gte: datenow }, sortOrder: { $ne: null } },
      ]
    }, {
      uuid: 1, vertical: 1, title: 1, description: 1, sortOrder: 1, dateStart: 1, pages: 1, image: 1, shareOfVoiceMatrix: 1, shareOfVoiceType: 1, shareOfVoiceValue: 1
    }
  ).lean().exec()

  res.jsonp(products)
}
