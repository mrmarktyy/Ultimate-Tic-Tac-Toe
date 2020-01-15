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
const recommendedMultiplier = require('../../utils/recommendedMultiplier').multiplier

exports.list = async function (req, res) {
	let result = await addVariations()
	res.jsonp(result)
}

async function addVariations () {
  const companyVerticalData = await CompanyPersonalLoan.model.find().populate('company big4ComparisonProduct').lean().exec()
	companyVerticalData.forEach((obj) => {
     obj.big4ComparisonProductUuid = obj.big4ComparisonProduct ? obj.big4ComparisonProduct.uuid : null
  })

  let variations = await PersonalLoanVariation.model.find().populate('product company').lean().exec()
  variations = variations
  .filter((variation) => {
    return (variation.product && variation.product.isDiscontinued === false)
  })
  .map((variation) => {
    variation = removeUneededFields(variation)

    variation.product.repaymentType = changeCase.titleCase(variation.product.repaymentType)
		variation.product.securedType = changeCase.titleCase(variation.product.securedType)
		variation.product.company = CompanyService.fixLogoUrl(variation.product.company)
		// setPromotedOrder(loan)
    variation.product.promotedOrder = 100
    variation.product.popularityScore = (variation.product.monthlyClicks ? variation.product.monthlyClicks * recommendedMultiplier : 0)
    delete variation.product.monthlyClicks
    // company vertical data
		variation.companyVertical  = companyVerticalData
		.filter((verticalData) => verticalData.company.uuid === variation.company.uuid)[0] || {}
    
    // if (variation.companyVertical) {
    //   delete variation.companyVertical.company
    // }
    return handleComparisonRate(variation)
  })

  variations = flattenNested(variations, {product: 'product_', company: 'company_', companyVertical: 'companyVertical_'})
  console.log(variations)
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