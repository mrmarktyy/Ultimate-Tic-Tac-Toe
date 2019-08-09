var keystone = require('keystone')
var salesforceVerticals = require('../../models/helpers/salesforceVerticals')
var mongoose = require('mongoose')
var Monetize = keystone.list('Monetize').model
var PartnerProduct = keystone.list('PartnerProduct')
var Log = keystone.list('Log')
var logger = require('../../utils/logger')

function log (event, response) {
  (new Log.model({event: event, message: JSON.stringify(response)})).save((error) => {
    if (error) {
      logger.error(error)
    }
  })
}

exports.monetize = async function (req, res) {
  try {
    log('salesforce-incoming', req.body)

    let products = req.body
    let missingUUIDs = []

    for (var i = 0; i < products.length; i++) {
      let partnerProduct = null
      let changeRequest = products[i]
      let [ultimateVertical, collection] = translateSalesforceVertical(changeRequest.RC_Product_Type)
      if (ultimateVertical === false) {
        continue
      }
      let uuid = changeRequest.RC_Product_ID

      let productModel = keystone.list(collection)
      let product =  await productModel.model.findOne({ uuid: uuid }).populate('company').lean()
      if (product) {
        let ProductModel = mongoose.model(collection)
        await ProductModel.findOneAndUpdate({uuid: uuid}, {isMonetized: changeRequest.RC_Active}, {new: true})
      } else {
        partnerProduct = await PartnerProduct.model.findOne({ uuid: uuid }).lean()
        if (partnerProduct) {
          product = await productModel.model.findOne({ uuid: partnerProduct.parentUuid }).populate('company').lean()
        }
      }
      if (!product) {
        missingUUIDs.push(uuid)
        continue
      }

      await Monetize.findOneAndUpdate(
          { uuid: uuid },
          {
            vertical: ultimateVertical,
            applyUrl: changeRequest.RC_Url,
            product: partnerProduct ? partnerProduct._id : product._id,
            productName: partnerProduct ? partnerProduct.name : product.name,
            companyName: product.company.name,
            enabled: changeRequest.RC_Active,
            updatedAt: new Date().toISOString(),
          },
          { upsert: true },
        )
    }

    if (missingUUIDs.length === 0) {
      let response = { text: 'OK' }
      log('salesforce-response', response)
      res.status(200).jsonp(response)
    } else {
      let response = { message: 'Missing UUIDs', missing: missingUUIDs }
      log('salesforce-response', response)
      res.status(400).jsonp(response)
    }
  } catch (err) {
      logger.error(err)
      let response = { error: err }
      log('salesforce-response', response)
      res.jsonp(response)
  }
}

function translateSalesforceVertical (vertical) {
  let ultimateVertical = Object.keys(salesforceVerticals).filter((key) => {
    return salesforceVerticals[key].salesforceVertical === vertical
  })[0]
  if (typeof ultimateVertical === 'undefined'){
    return [false, false]
  }
  return [ultimateVertical, salesforceVerticals[ultimateVertical].collection]
}
