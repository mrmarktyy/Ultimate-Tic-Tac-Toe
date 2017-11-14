require('dotenv').config()

var keystone = require('keystone')
const _ = require('lodash')
var path = require('path')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var csvToJson = require('../utils/csvToJson')
var logger = require('../utils/logger')
var utils = keystone.utils

const csvFilePath = path.join(__dirname, './tmp/termDeposits.csv')
const termDeposits = keystoneShell.list('TermDeposit')
const company = keystoneShell.list('Company')

module.exports = async function () {
	let connection = await mongoosePromise.connect()
	try {
		const data = await csvToJson(csvFilePath)
		for (let item of data) {
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
			const companyData = await company.model.findOne({
				$or: [
					{name: {$regex: new RegExp(`^${item.company}$`, 'i')}},
					{displayName: {$regex: new RegExp(`^${item.company}$`, 'i')}},
					{shortName: {$regex: new RegExp(`^${item.company}$`, 'i')}},
					{otherNames: {$regex: new RegExp(`^${item.company}$`, 'i')}},
				]
			}).exec()
			obj.legacyID = item.legacyID
			obj.company = companyData && companyData._id
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

			let termDepositsData = await termDeposits.model.findOne({'uuid': obj.uuid}).exec()
			if (!termDepositsData) {
				termDepositsData = new termDeposits.model(obj)
			} else {
				_.merge(termDepositsData, obj)
			}

			await termDepositsData.save(err => {
				if (err) {
					logger.error(err)
				}
			})
		}
		connection.close()
	} catch (error) {
		logger.error(error)
		return error
	}
}()

function checkFeature(feature) {
	return !feature ? 'UNKNOWN' : feature
}
