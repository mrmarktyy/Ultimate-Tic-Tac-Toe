require('dotenv').config()

var keystone = require('keystone')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var csvToJson = require('../utils/csvToJson')
var logger = require('../utils/logger')
var utils = keystone.utils

const csvFilePath = './tmp/savingsAccounts.csv'
const savingsAccounts = keystoneShell.list('SavingsAccount')
const savingsAccountsTiers = keystoneShell.list('SavingsAccountTier')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    const data = await csvToJson(csvFilePath)
    let list = []

    data.forEach((item) => {
      let obj = {}

      obj.name = item.Name

      if (item.uuid) {
        obj.uuid = item.uuid
      }

      let slug
      if (!item.slug) {
        slug = utils.slug(item.Name.toLowerCase())
      } else {
        slug = item.slug
      }

      obj.slug = slug
      obj.company = item.company
      obj.legacyCode = item.legacyID
      obj.isSpecial = item.isSpecial
      obj.isRCSpecial = item.isRCSpecial
      obj.offerExpires = item.offerExpires
      obj.otherBenefits = item.otherBenefits
      obj.otherRestrictions = item.otherRestrictions
      obj.minimumAgeRestrictions = item.minimumAgeRestrictions
      obj.maximumAgeRestrictions = item.maximumAgeRestrictions
      obj.minimumOpeningDeposit = item.minimumOpeningDeposit
      obj.linkedAccountRequired = item.linkedAccountRequired
      obj.isOnlineOnly = item.isOnlineOnly
      obj.hasAtmAccess = item.hasAtmAccess
      obj.hasEftposFacility = item.hasEftposFacility
      obj.hasInternetFacility = item.hasInternetFacility
      obj.hasPhoneFacility = item.hasPhoneFacility
      obj.hasBranchAccess = item.hasBranchAccess
      obj.accountKeepingFees = item.accountKeepingFees
      obj.accountKeepingFeesFrequency = item.accountKeepingFeesFrequency
      obj.internetTransactionFee = item.internetTransactionFee
      obj.phoneTransactionFee = item.phoneTransactionFee
      obj.eftposFee = item.eftposFee
      obj.overseasEftposFee = item.overseasEftposFee
      obj.overTheCounterDepositFee = item.overTheCounterDepositFee
      obj.overTheCounterWithdrawalFee = item.overTheCounterWithdrawalFee
      obj.atmWithdrawalFee = item.atmWithdrawalFee

      list.push(obj)
    })

    await savingsAccounts.model.insertMany(list, (error) => {
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
