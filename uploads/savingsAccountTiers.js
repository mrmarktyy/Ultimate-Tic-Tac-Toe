require('dotenv').config()

var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var csvToJson = require('../utils/csvToJson')
var logger = require('../utils/logger')

const csvFilePath = './tmp/savingsAccountsTiers.csv'
const savingsAccountsTiers = keystoneShell.list('SavingsAccountTier')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    const data = await csvToJson(csvFilePath)
    let list = []

    data.forEach((item) => {
      let obj = {}
      obj.company = item.company
      obj.product = item.product
      obj.name = item.name
      obj.repVariation = item.repVariation === '' ? 'UNKNOWN' : item.repVariation
      obj.minimumAmount = item.minimumAmount
      obj.maximumAmount = item.maximumAmount
      obj.maximumRate = item.maximumRate
      obj.baseRate = item.baseRate
      obj.bonusRate = item.bonusRate
      obj.bonusRateCondition = item.bonusRateCondition
      obj.introductoryRate = item.introductoryRate
      obj.introductoryRateTerm = item.introductoryRateTerm

      list.push(obj)
    })

    await savingsAccountsTiers.model.insertMany(list, (error) => {
      if (error) {
        logger.error(error)
        return error
      }
    })

    connection.close()
  } catch (error) {
    logger.error(error)
    return error
  }
}()
