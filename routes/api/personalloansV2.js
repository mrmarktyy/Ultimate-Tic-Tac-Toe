var keystone = require('keystone')
var changeCase = require('change-case')
var _ = require('lodash')

var PersonalLoanVariation = keystone.list('PersonalLoanVariation')
var CompanyPersonalLoan = keystone.list('CompanyPersonalLoan')
var PersonalLoanQualification = keystone.list('PersonalLoanQualification')
var CompanyService = require('../../services/CompanyService')
var logger = require('../../utils/logger')
var monetizedCollection = require('./monetizedCollection')
var removeUneededFields = require('../../utils/removeUneededFields')
const recommendedMultiplier = require('../../utils/recommendedMultiplier').multiplier
const PartnerGotoSite = require('../../services/PartnerGotoSite')

exports.list = async function (req, res) {
	let result = await addVariations()
	res.jsonp(result)
}

async function addVariations () {
  const companyVerticalData = await CompanyPersonalLoan.model.find().populate('company big4ComparisonProduct').select('-createdAt -createdBy -updatedBy -updatedAt -__v -_id').lean().exec()
	companyVerticalData.forEach((obj) => {
     obj.big4ComparisonProductUuid = obj.big4ComparisonProduct ? obj.big4ComparisonProduct.uuid : null
  })

	const monetizeCarLoans = await monetizedCollection('Car Loans')
	const monetizePersonalLoans = await monetizedCollection('Personal Loans')
  const qualifications = await PersonalLoanQualification.model.find().populate('company product').populate({path: 'knockouts', populate: {path: 'qualifications', populate: {path: 'bureauAttribute'}}}).lean().exec()
	const monetizedList = _.merge({}, monetizeCarLoans, monetizePersonalLoans)

  let variations = await PersonalLoanVariation.model.find()
    //.populate('product company').lean().exec()
    .populate({path: 'product', select: '-createdAt -createdBy -updatedBy -updatedAt -__v -_id'})
    .populate({path: 'company', select: '-createdAt -createdBy -updatedBy -updatedAt -__v -_id'})
    .lean().exec()

  const partnerGotoSitePersonal = await PartnerGotoSite('personal-loans')
  const partnerGotoSiteCar = await PartnerGotoSite('car-loans')
  variations = variations
  .filter((variation) => {
    return (variation.product && variation.product.isDiscontinued === false)
  })
  .map((variation) => {
    variation = removeUneededFields(variation)

    // monetize data
		let monetize = monetizedList[variation.product._id]

		variation.product.gotoSiteUrl = monetize ? monetize.applyUrl : null
    variation.product.gotoSiteEnabled = monetize ? monetize.enabled : false
    variation.product.gotoSiteEnabledPartnersPersonal = partnerGotoSitePersonal[variation.product.uuid] || []
    variation.product.gotoSiteEnabledPartnersCar = partnerGotoSiteCar[variation.product.uuid] || []
		variation.product.paymentType = monetize ? monetize.paymentType : null

    variation.product.repaymentType = changeCase.titleCase(variation.product.repaymentType)
		variation.product.securedType = changeCase.titleCase(variation.product.securedType)
		variation.product.company = CompanyService.fixLogoUrl(variation.product.company)
		// setPromotedOrder(loan)
    variation.product.promotedOrder = 100
    // qualification data
		variation.product.qualifications = qualifications.filter((qualification) => {
			if (qualification.product) {
				return qualification.product.uuid === variation.product.uuid
			} else if (qualification.company) {
				return qualification.company.uuid === variation.company.uuid
			} else {
				return false
			}
		}).map((qualification) => {
			qualification.knockouts = (qualification.knockouts || []).map((knockout) => {
				knockout.qualifications = (knockout.qualifications || []).map((qualification) => removeUneededFields(qualification))
				return removeUneededFields(knockout)
			})
			return removeUneededFields(qualification, ['company', 'product'])
    })

    variation.product.popularityScore = (variation.product.monthlyClicks ? variation.product.monthlyClicks * recommendedMultiplier : 0)
    delete variation.product.monthlyClicks
    // company vertical data
		variation.companyVertical  = companyVerticalData
		.filter((verticalData) => verticalData.company.uuid === variation.company.uuid)[0] || {}
    return handleComparisonRate(variation)
  })
  .map((variation) => {
    delete variation.companyVertical.company
    return variation
  })

  variations = flattenNested(variations, {product: 'product_', company: 'company_', companyVertical: 'companyVertical_'})
  return variations
}

function flattenNested (records, fields = {}) {
  let obj = {}
  return records.map((record) => {
    obj = {}
    Object.keys(fields).forEach((field) => {
      Object.keys(record[field]).forEach((key) =>{
        if (key === '_id') {
          obj[`${field}${key}`] = record[field][key]
        } else {
          obj[`${fields[field]}${key}`] = record[field][key]
        }
      })
      delete record[field]
    })
    return _.merge({}, obj, record)
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
	if (variation.maxComparisonRateManual) {
		variation.maxComparisonRate = variation.maxComparisonRateManual
	} else {
		variation.maxComparisonRateManual = null
		variation.maxComparisonRate = variation.maxComparisonRate
	}

	return variation
}