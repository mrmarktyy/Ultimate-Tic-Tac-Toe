var keystone = require('keystone')

var SaleEventProduct = keystone.list('SaleEventProduct')
var SaleEventProductField = keystone.list('SaleEventProductField')
var logger = require('../../utils/logger')
var removeUneededFields = require('../../utils/removeUneededFields')

exports.list = async function (req, res) {
  let results = []
  try {
    let saleEventProductFields = await SaleEventProductField.model.find({}).lean().exec()
    saleEventProductFields = saleEventProductFields.map((item) => removeUneededFields(item))

    const products = await SaleEventProduct.model.find({}).lean().exec()

    products.forEach((product) => {
      let newFields = saleEventProductFields.filter((item) => item.product.toString() === product._id.toString())

      let obj = {}

      newFields.forEach((field) => {
        obj[field.description] = field.value
      })

      results.push(
        Object.assign(
          {},
          product,
          obj
        )
      )
    })

    results = results.map((item) => removeUneededFields(item, ['createdAt', 'createdBy', 'updatedBy', 'updatedAt', '__v']))
  } catch (e) {
    logger.error(e)
    res.jsonp({ error: e })
  }

  res.jsonp(results)
}
