// node --harmony_async_await uploads/creditcardsMonetized.js
require('dotenv').config()

var keystone = require('keystone')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var csvToJson = require('../utils/csvToJson')
var utils = keystone.utils

const csvCCFilePath = './tmp/monetizedcreditcards.csv'
const CreditCard = keystoneShell.list('CreditCard')
const Monetize = keystoneShell.list('Monetize')

async function monetizeCreditCards () {
let connection = await mongoosePromise.connect()
  try {
    let data = await csvToJson(csvCCFilePath)
    for (let i = 0; i < data.length; i++) {
      let record = data[i]
      let product = await CreditCard.model.findOne({uuid: record.uuid}).populate('company').lean().exec()
      console.log(product)
      await Monetize.model.findOneAndUpdate(
            {
              uuid: record.uuid,
            },
            {$set: {
              vertical: 'Credit Cards',
              applyUrl: record.url,
              product: product._id,
              productName: product.name,
              companyName: product.company.name,
              enabled: true,
              updatedAt: new Date().toISOString(),
            }},
            {
              new: true,
              upsert: true,
            }).exec()

      await CreditCard.model.findOneAndUpdate({uuid: record.uuid}, {$set: {isMonetized: true}}, {}).exec()
    }
    connection.close()
  } catch (error) {
    console.log(error)
    return error
  }
}

module.exports = async function () {
  await monetizeCreditCards()
}()

