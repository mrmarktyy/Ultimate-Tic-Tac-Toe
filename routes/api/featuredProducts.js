var keystone = require('keystone')

var FeaturedProduct = keystone.list('FeaturedProduct')
var MonetizeProduct = keystone.list('Monetize')
var removeUneededFields = require('../../utils/removeUneededFields')

exports.list = async function (req, res) {
  let datenow = new Date()
  let products = await FeaturedProduct.model.find(
    {
      $or: [
        { dateStart: { $lte: datenow }, enabled: true, dateEnd: null, sortOrder: { $ne: null } },
        { dateStart: { $lte: datenow }, enabled: true, dateEnd: { $gte: datenow }, sortOrder: { $ne: null } },
      ],
    }, {
      uuid: 1, vertical: 1, title: 1, description: 1, sortOrder: 1, dateStart: 1, pages: 1, image: 1, shareOfVoiceMatrix: 1, shareOfVoiceType: 1, shareOfVoiceValue: 1,
    }
  ).lean().exec()

  const monetizedProducts = await MonetizeProduct.model.find({ enabled: true }).lean().exec()
  products = products.map((product) => {
    const monetized = monetizedProducts.find((item) => item.uuid === product.uuid)

    if (monetized) {
      product.monetized = true
    } else {
      product.monetized = false
    }

    return removeUneededFields(product)
  })

  res.jsonp(products)
}
