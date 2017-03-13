var keystone = require('keystone')

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
var CompanyService = require('../../services/CompanyService')
var logger = require('../../utils/logger')

exports.list = async function (req, res) {

  let promise = HomeLoan.model.find({ $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] }).populate('company homeLoanFamily').lean().exec()
  let response = {}
  let relationshipPromises = []
  let monetizedVariations = await monetizedCollection()

  promise.then((homeLoans) => {
    homeLoans.forEach((homeLoan) => {
      homeLoan.company = CompanyService.fixLogoUrl(homeLoan.company)
      if (homeLoan.promotedOrder === '0') {
        homeLoan.promotedOrder = null
      } else {
        homeLoan.promotedOrder = 100 - parseInt(homeLoan.promotedOrder)
      }

      let companyPromise = CompanyHomeLoan.model.find({ company: homeLoan.company._id }).lean().exec((err, company) => {
        if (err) {
          logger.error('database error on find company personal loan vertical by company id')
          return 'database error'
        }
        response[homeLoan._id] = Object.assign({}, homeLoan, response[homeLoan._id], { companyVertical: company })
      })
      relationshipPromises.push(companyPromise)

      let variationPromise = HomeLoanVariation.model.find({ product: homeLoan._id }).populate('revertVariation').lean().exec((err, variations) => {
        if (err) {
          logger.error('database error on find homeloan loan variation by product id')
          return 'database error'
        }
        variations = variations.map((v) => {
          v.revertRate = null
          v.gotoSiteUrl = null
          v.gotoSiteEnabled = false
          if (v.revertVariation) {
            v.revertRate = v.revertVariation.rate
            delete v.revertVariation
          }
          let monetize = monetizedVariations[v._id]
          if (monetize) {
            v.gotoSiteUrl = monetize.applyUrl
            v.gotoSiteEnabled = monetize.enabled
          }
          return v
        })
        response[homeLoan._id] = Object.assign({}, homeLoan, response[homeLoan._id], { variations: variations })
      })
      relationshipPromises.push(variationPromise)

      let offsetPromise = OffsetAccount.model.find({ product: homeLoan._id }).lean().exec((err, offsetAccounts) => {
        if (err) {
          logger.error('database error on find homeloan loan offset account by product id')
          return 'database error'
        }
        response[homeLoan._id] = Object.assign({}, homeLoan, response[homeLoan._id], { offsetAccounts: offsetAccounts })
      })
      relationshipPromises.push(offsetPromise)

      let redrawPromise = RedrawFacility.model.find({ product: homeLoan._id }).lean().exec((err, redraws) => {
        if (err) {
          logger.error('database error on find homeloan loan redraw facility by product id')
          return 'database error'
        }
        response[homeLoan._id] = Object.assign({}, homeLoan, response[homeLoan._id], { redrawfacilities: redraws })
      })
      relationshipPromises.push(redrawPromise)

      let feePromise = Fee.model.find({ product: homeLoan._id }).lean().exec((err, fees) => {
        if (err) {
          logger.error('database error on find homeloan loan fees by product id')
          return 'database error'
        }
        response[homeLoan._id] = Object.assign({}, homeLoan, response[homeLoan._id], { fees: fees })
      })
      relationshipPromises.push(feePromise)

      let featurePromise = Feature.model.find({ product: homeLoan._id }).lean().exec((err, features) => {
        if (err) {
          logger.error('database error on find homeloan loan feature by product id')
          return 'database error'
        }
        response[homeLoan._id] = Object.assign({}, homeLoan, response[homeLoan._id], { features: features })
      })
      relationshipPromises.push(featurePromise)

      let conditionPromise = Condition.model.find({ product: homeLoan._id }).lean().exec((err, conditions) => {
        if (err) {
          logger.error('database error on find homeloan loan condition by product id')
          return 'database error'
        }
        response[homeLoan._id] = Object.assign({}, homeLoan, response[homeLoan._id], { conditions: conditions })
      })
      relationshipPromises.push(conditionPromise)

      let extraRepaymentPromise = ExtraRepayment.model.find({ product: homeLoan._id }).lean().exec((err, extraRepayments) => {
        if (err) {
          logger.error('database error on find homeloan loan extra repayment by product id')
          return 'database error'
        }
        response[homeLoan._id] = Object.assign({}, homeLoan, response[homeLoan._id], { extraRepayments: extraRepayments })
      })
      relationshipPromises.push(extraRepaymentPromise)
    })
    Promise.all(relationshipPromises).then(() => {
      let result = []
      for (let key in response) {
        result.push(response[key])
      }
      res.jsonp(result)
    })
  })
}

async function monetizedCollection () {
  var obj = {}
  await Monetize.model.find({vertical: 'Home Loans'})
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
