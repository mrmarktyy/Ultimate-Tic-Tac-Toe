require('dotenv').config()

var keystone = require('keystone')
var path = require('path')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var csvToJson = require('../utils/csvToJson')
var logger = require('../utils/logger')
var utils = keystone.utils

const csvFilePath = path.join(__dirname, './tmp/termDeposits.csv')
const termDeposits = keystoneShell.list('TermDeposit')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    const data = await csvToJson(csvFilePath)
    let list = []

    data.forEach((item) => {
      let obj = {}

      obj.name = item.name

      if (item.productUuid) {
        obj.uuid = item.productUuid
      }

      let slug
      if (!item.slug) {
        slug = utils.slug(item.name.toLowerCase())
      } else {
        slug = item.slug
      }
      obj.slug = slug
      obj.company = item.company
      obj.accountKeepingFee = item.accountKeepingFee
      obj.earlyWithdrawalPenalty = item.earlyWithdrawalPenalty
      obj.otherBenefits = item.otherBenefits
      obj.otherRestrictions = item.otherRestrictions
      obj.minimumAgeRequirement = item.minimumAgeRequirement
      obj.noticePeriodToWithdraw = item.noticePeriodToWithdraw
      obj.jointApplicationAvailable = checkFeature(item.jointApplicationAvailable)
			obj.maturityAlertByPhone = checkFeature(item.maturityAlertByPhone)
			obj.maturityAlertByEmail = checkFeature(item.maturityAlertByEmail)
      obj.automaticMaturityRollover = checkFeature(item.automaticMaturityRollover)
      obj.interestPaymentViaOtherInstitution = checkFeature(item.interestPaymentViaOtherInstitution)
      obj.earlyWithdrawalAvailable = checkFeature(item.earlyWithdrawalAvailable)
			obj.isCoveredByGovernmentGuarantee = checkFeature(item.isCoveredByGovernmentGuarantee)
      obj.interestPaymentFrequencyOptions = item.interestPaymentFrequencyOptions
      obj.interestPaymentMethod = item.interestPaymentMethod
      obj.accountKeepingFeeFrequency = item.accountKeepingFeeFrequency
      list.push(obj)
    })

    await termDeposits.model.insertMany(list, (error) => {
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

function checkFeature (feature){
	return !feature ? 'UNKNOWN' : feature
}
