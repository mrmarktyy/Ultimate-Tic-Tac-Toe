var keystone = require('keystone')
var mongoose = require('mongoose')
var changeCase = require('change-case')

var PersonalLoan = keystone.list('PersonalLoan')
var PersonalLoanVariation = keystone.list('PersonalLoanVariation')
var CompanyPersonalLoan = keystone.list('CompanyPersonalLoan')
var Monetize = mongoose.model('Monetize')
var CompanyService = require('../../services/CompanyService')
var logger = require('../../utils/logger')

exports.list = function (req, res) {

	let promise = PersonalLoan.model.find({ isDiscontinued: false }).populate('company').lean().exec()

	let response = {}
	let variationPromises = []
	promise.then((personalLoans) => {
		personalLoans.forEach((personalLoan) => {
			// change the value to titleCase
			['repaymentType', 'securedType'].forEach((attribute) => {
				personalLoan[attribute] = changeCase.titleCase(personalLoan[attribute])
			})
			personalLoan.company = CompanyService.fixLogoUrl(personalLoan.company)
			// this make sure API always return promotedOrder for all products
			if (personalLoan.promotedOrder === '0') {
				personalLoan.promotedOrder = null
			} else {
				personalLoan.promotedOrder = 100 - parseInt(personalLoan.promotedOrder)
			}

			let promise = PersonalLoanVariation.model.find({ product: personalLoan._id }).lean().exec((err, variations) => {
				if (err) {
					logger.error('database error on find personal loan variation by product id')
					return 'database error'
				}
				let variationObjects = variations.map((v) => {
					return handleComparisonRate(v)
				})
				response[personalLoan._id] = Object.assign({}, personalLoan, response[personalLoan._id], { variations: variationObjects })
			})
			variationPromises.push(promise)

			let plcPromise = CompanyPersonalLoan.model.find({ company: personalLoan.company._id }).lean().exec((err, plc) => {
				if (err) {
					logger.error('database error on find company personal loan vertical by company id')
					return 'database error'
				}
				response[personalLoan._id] = Object.assign({}, personalLoan, response[personalLoan._id], { companyVertical: plc })
			})
			variationPromises.push(plcPromise)

			let mntzPromise = Monetize.findOne({ product: personalLoan._id }).lean().exec((err, monetize) => {
				if (err) {
					logger.error('database error on find monetize by product id')
					return 'database error'
				}
				let applyUrl = null
				let enabled = false
        let paymentType = null
				if (monetize !== null) {
					applyUrl = monetize.applyUrl
					enabled = monetize.enabled
          paymentType = monetize.paymentType
				}
				response[personalLoan._id] = Object.assign({}, personalLoan, response[personalLoan._id], { gotoSiteUrl: applyUrl, gotoSiteEnabled: enabled, paymentType: paymentType })
			})
			variationPromises.push(mntzPromise)
		})

		Promise.all(variationPromises).then(() => {
			let result = []
			for (let key in response) {
				result.push(response[key])
			}
			res.jsonp(result)
		})
	})
}

exports.one = function (req, res) {

	let id = req.params.id
	let promise = PersonalLoan.model.findById(id).populate('company').lean().exec()

	promise.then((personalLoan) => {
		if (personalLoan == null) {
			res.jsonp('{error: id not found }')
			return
		}
		personalLoan.company = CompanyService.fixLogoUrl(personalLoan.company)
		PersonalLoanVariation.model.find({ product: personalLoan._id }).lean().exec((err, variation) => {
			if (err) {
				logger.error('database error on find personal loan variation by product id')
				return 'database error'
			}
			personalLoan.variations = variation
			res.jsonp(personalLoan)
		})
	}).catch((e) => {
		logger.error(e)
		res.jsonp('{error:error}')
	})
}

function handleComparisonRate (variation) {
	if (variation.comparisonRatePersonalManual) {
		variation.personalLoanComparisonRate = variation.comparisonRatePersonalManual
	} else {
		variation.personalLoanComparisonRate = variation.comparisonRatePersonal
	}

	if (variation.comparisonRateCarManual) {
		variation.carLoanComparisonRate = variation.comparisonRateCarManual
	} else {
		variation.carLoanComparisonRate = variation.comparisonRateCar
	}

	return variation
}
