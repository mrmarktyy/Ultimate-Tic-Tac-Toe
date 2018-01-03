var keystone = require('keystone')
var changeCase = require('change-case')
var _ = require('lodash')

var PersonalLoan = keystone.list('PersonalLoan')
var PersonalLoanVariation = keystone.list('PersonalLoanVariation')
var CompanyPersonalLoan = keystone.list('CompanyPersonalLoan')
var PersonalLoanQualification = keystone.list('PersonalLoanQualification')
var CompanyService = require('../../services/CompanyService')
var logger = require('../../utils/logger')
var monetizedCollection = require('./monetizedCollection')
var removeUneededFields = require('../../utils/removeUneededFields')
var setPromotedOrder = require('../../utils/helperFunctions').setPromotedOrder
const recommendedMultiplier = require('../../utils/recommendedMultiplier').multiplier

exports.list = async function (req, res) {
	let personalLoans = await PersonalLoan.model.find({ isDiscontinued: false }).populate('company').lean().exec()
	let result = await getPersonalLoanObjects(personalLoans)
	res.jsonp(result)
}

async function getPersonalLoanObjects (loans) {
	const variations = await PersonalLoanVariation.model.find().populate('product').lean().exec()
	const companyVerticalData = await CompanyPersonalLoan.model.find().populate('company big4ComparisonProduct').lean().exec()
	companyVerticalData.forEach((obj) => {
     obj.big4ComparisonProductUuid = obj.big4ComparisonProduct ? obj.big4ComparisonProduct.uuid : null
  })

	const monetizeCarLoans = await monetizedCollection('Car Loans')
	const monetizePersonalLoans = await monetizedCollection('Personal Loans')
	const qualifications = await PersonalLoanQualification.model.find().populate('company product').lean().exec()

	const monetizedList = _.merge({}, monetizeCarLoans, monetizePersonalLoans)

	let result = loans.map((loan) => {
		// variations
		loan.variations = variations
		.filter((variation) => variation.product.uuid === loan.uuid)
		.map((variation) => {
			variation = removeUneededFields(variation, ['product', 'company'])

			return handleComparisonRate(variation)
		})

		// company vertical data
		loan.companyVertical = companyVerticalData
		.filter((verticalData) => verticalData.company.uuid === loan.company.uuid)
		.map((verticalData) => {
			verticalData = removeUneededFields(verticalData, ['company', 'big4ComparisonProduct'])

			return verticalData
		})

		// monetize data
		let monetize = monetizedList[loan._id]

		loan.gotoSiteUrl = monetize ? monetize.applyUrl : null
		loan.gotoSiteEnabled = monetize ? monetize.enabled : false
		loan.paymentType = monetize ? monetize.paymentType : null

		// enrich data
		loan.repaymentType = changeCase.titleCase(loan.repaymentType)
		loan.securedType = changeCase.titleCase(loan.securedType)
		loan.company = CompanyService.fixLogoUrl(loan.company)
		setPromotedOrder(loan)

		// qualification data
		loan.qualifications = qualifications.filter((qualification) => {
			if (qualification.product) {
				return qualification.product.uuid === loan.uuid
			} else if (qualification.company) {
				return qualification.company.uuid === loan.company.uuid
			} else {
				return false
			}
		}).map((qualification) => {
			qualification = removeUneededFields(qualification, ['company', 'product'])

			return qualification
		})

		loan.popularityScore = (loan.monthlyClicks ? loan.monthlyClicks * recommendedMultiplier : 0)
		delete loan.monthlyClicks
		return loan
	})

	return result
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
	if (variation.comparisonRatePersonalManual5Years) {
		variation.personalLoanComparisonRate5Years = variation.comparisonRatePersonalManual5Years
	} else {
		variation.comparisonRatePersonalManual5Years = null
		variation.personalLoanComparisonRate5Years = variation.comparisonRatePersonal5Years
	}
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
