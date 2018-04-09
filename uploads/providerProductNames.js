// node uploads/homeLoanvendorProductNames.js

require('dotenv').config()

var keystone = require('keystone')
const _ = require('lodash')
var path = require('path')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var csvToJson = require('../utils/csvToJson')
var logger = require('../utils/logger')
var utils = keystone.utils

const csvFilePath = path.join(__dirname, '../tmp/companyproductnames.csv')
const ProviderProductName = keystoneShell.list('ProviderProductName')
const HomeLoanVariation = keystoneShell.list('HomeLoanVariation')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  await ProviderProductName.model.remove({})
  await HomeLoanVariation.model.update({}, {$set: {providerProductName: null}}, {multi: true}).exec()
  try {
    console.log('here')
    const data = await csvToJson(csvFilePath)
    for (let item of data) {
      let uuid = item.uuid
      if (item.CPN) {
        let variation = await HomeLoanVariation.model.findOne({uuid: uuid}).lean().exec()
        if (!variation.providerProductName) {
          console.log('xxx' + JSON.stringify(variation.company))
          let offical = await ProviderProductName.model.findOne({company: variation.company, name: item.CPN})
          if (!offical) {
            console.log('here')
            await ProviderProductName.model.create({company: variation.company, name: item.CPN}, (error, providerProductName) => {
              if (error) {
                console.log(error)
                return error
              }
              offical = providerProductName
            })
          }
          console.log(JSON.stringify(offical))
          console.log(JSON.stringify(offical._id))
          await HomeLoanVariation.model.update({uuid: uuid}, {$set: {providerProductName: offical._id}}, {}).exec()
        }
      }
    }
    connection.close()
  } catch (error) {
    logger.error(error)
    return error
  }
}()
