require('dotenv').config()
var path = require('path')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var csvToJson = require('../utils/csvToJson')
var logger = require('../utils/logger')

const csvFilePath = path.join(__dirname, './tmp/savingsAccountsTiers.csv')
const termDepositsTiers = keystoneShell.list('TermDepositTier')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    const data = await csvToJson(csvFilePath)
    let list = []

    data.forEach((item) => {
      let obj = {}
      obj.company = item.companyUUID
      obj.product = item.productUUID
      obj.name = item.name
      obj.minimumDeposit = item.minimumDeposit
      obj.maximumDeposit = item.maximumDeposit
      obj.interestRate = item.interestRate
      obj.minimumTerm = item.minimumTerm
      obj.maximumTerm = item.maximumTerm
      obj.interestPaymentFrequencyShortTerm = item.interestPaymentFrequencyShortTerm
      obj.interestPaymentFrequencyLongTerm = item.interestPaymentFrequencyLongTerm
      obj.interestCalculationFrequency = item.interestCalculationFrequency

      list.push(obj)
    })

    await termDepositsTiers.model.insertMany(list, (error) => {
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
