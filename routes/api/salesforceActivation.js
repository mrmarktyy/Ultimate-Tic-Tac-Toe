var keystone = require('keystone')
var salesforceVerticals = require('../../models/helpers/salesforceVerticals')
var mongoose = require('mongoose')
var Monetize = mongoose.model('Monetize')

exports.monetize = function (req, res) {
  let products = req.body
  let missingUUIDs = []
  let promise
  let promises = []

  for (var i = 0; i < products.length; i++) {
    let change_request = products[i]
    if (typeof (salesforceVerticals[change_request.RC_Product_Type]) === 'undefined') {
      continue
    }
    let uuid = change_request.RC_Product_ID

    let product = keystone.list(salesforceVerticals[change_request.RC_Product_Type])
    promise = product.model.findOne({ uuid: uuid })
    .exec()
    .then((product) => {
      if (product === null) {
        missingUUIDs.push(uuid)
      } else {
        return (Monetize.findOneAndUpdate(
          {
            uuid: uuid,
          },
          {
            vertical: change_request.RC_Product_Type,
            applyUrl: change_request.RC_Url,
            product: product._id,
            enabled: change_request.RC_Active,
          },
          {
            new: true,
            upsert: true,
          })
        )
      }
    })
    .catch((err) => {
      console.log(err)
      res.jsonp({ error: err })
    })

    promises.push(promise)

  }
  Promise.all(promises).then(() => {
    if (missingUUIDs.length === 0) {
      res.status(200).jsonp({ text: 'OK' })
    } else {
      res.status(400).jsonp({ message: 'Missing UUIDs', missing: missingUUIDs })
    }
  })
}
