var keystone = require('keystone')
var _ = require('lodash')
var HomeLoan = keystone.list('HomeLoan')
var HomeLoanVariation = keystone.list('HomeLoanVariation')
var OffsetAccount = keystone.list('OffsetAccount')
var RedrawFacility = keystone.list('RedrawFacility')
var Fee = keystone.list('Fee')
var Feature = keystone.list('Feature')
var Condition = keystone.list('Condition')
var ExtraRepayment = keystone.list('ExtraRepayment')
var CompanyHomeLoan = keystone.list('CompanyHomeLoan')
var Monetize = keystone.list('Monetize')
var HomeLoanSpecial = keystone.list('HomeLoanSpecial')
var CompanyService = require('../../services/CompanyService')
var logger = require('../../utils/logger')

function removeUneededFields (obj) {
  return _.omit(obj, ['product', '_id', 'company', 'createdAt', 'createdBy', 'updatedBy', 'updatedAt'])
}

function spawnVariation (variation, monetizedVariations) {
  variation.revertRate = null
  variation.gotoSiteUrl = null
  variation.gotoSiteEnabled = false
  variation.recommendScore = (variation.monthlyClicks ? variation.monthlyClicks * 5.32 : 0)
  delete variation.monthlyClicks
  if (variation.promotedOrder === '0') {
    variation.promotedOrder = null
  } else {
    variation.promotedOrder = 100 - parseInt(variation.promotedOrder)
  }

  if (variation.revertVariation) {
    variation.revertRate = variation.revertVariation.rate
    delete variation.revertVariation
  }
  let monetize = monetizedVariations[variation._id]
  if (monetize) {
    variation.gotoSiteUrl = monetize.applyUrl
    variation.gotoSiteEnabled = monetize.enabled
    variation.paymentType = monetize.paymentType
  }
  return removeUneededFields(variation)
}

function spawnFee (fee) {
 if (fee.frequency === 'SEMIANNUALLY') {
    fee.frequency = 'SEMI ANNUALLY'
  }
  return removeUneededFields(fee)
}

async function getHomeLoanModel (model, attribute = 'product') {
  var obj = {}
  await model.find({})
  .lean()
  .exec((err, data) => {
    if (err) {
      logger.error('database error on home loan api fetching monetized events')
      return 'database error'
    }
    data.forEach((datum) => {
      obj[datum[attribute]] = obj[datum[attribute]] || []
      obj[datum[attribute]].push(datum)
    })
  })
  return obj
}

async function monetizedCollection () {
  var obj = {}
  await Monetize.model.find({vertical: 'Home Loans', enabled: true})
  .lean()
  .exec((err, monetizes) => {
    if (err) {
      logger.error('database error on home loan api fetching monetized events')
      return 'database error'
    }
    monetizes.forEach((record) => {
      obj[record.product] = record
    })
  })
  return obj
}

exports.list = async function (req, res) {
  let homeLoans = await HomeLoan.model.find({ $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] }).populate('company homeLoanFamily').lean().exec()
  let monetizedVariations = await monetizedCollection()
  let offsetAccounts = await getHomeLoanModel(OffsetAccount.model)
  let redrawFacilities = await getHomeLoanModel(RedrawFacility.model)
  let fees = await getHomeLoanModel(Fee.model)
  let features = await getHomeLoanModel(Feature.model)
  let conditions = await getHomeLoanModel(Condition.model)
  let extraRepayments = await getHomeLoanModel(ExtraRepayment.model)
  let companyVerticals = await getHomeLoanModel(CompanyHomeLoan.model, 'company')
  let variations = await getHomeLoanModel(HomeLoanVariation.model)
  let homeLoanSpecials = await getHomeLoanModel(HomeLoanSpecial.model)

  let response = {}

  homeLoans.forEach((homeLoan) => {
    let company = CompanyService.fixLogoUrl(homeLoan.company)
    company = CompanyService.isBank(company)
    if (company.logo && company.logo.url) {
      company.logo = company.logo.url.replace(/(^\w+:|^)\/\//, '')
    }
    homeLoan.company = company

    response[homeLoan._id] = Object.assign(
      {},
      homeLoan,
      {
        variations: (variations[homeLoan._id] || []).map((v) => spawnVariation(v, monetizedVariations)),
        offsetAccounts: (offsetAccounts[homeLoan._id] || []).map(removeUneededFields),
        redrawfacilities: (redrawFacilities[homeLoan._id] || []).map(removeUneededFields),
        fees: (fees[homeLoan._id] || []).map(spawnFee),
        features: (features[homeLoan._id] || []).map(removeUneededFields),
        conditions: (conditions[homeLoan._id] || []).map(removeUneededFields),
        extraRepayments: (extraRepayments[homeLoan._id] || []).map(removeUneededFields),
        companyVertical: (companyVerticals[homeLoan.company._id] || []).map(removeUneededFields),
        homeLoanSpecials: (homeLoanSpecials[homeLoan._id] || []).map(removeUneededFields),
      }
    )
  })

  let result = []
  for (let key in response) {
    result.push(response[key])
  }
  res.jsonp(result)
}
