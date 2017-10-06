const keystone = require('keystone')
const changeCase = require('change-case')
const _ = require('lodash')

const Superannuation = keystone.list('Superannuation')
const monetizedCollection = require('./monetizedCollection')
const CompanyService = require('../../services/CompanyService')
const { years, ratings, segments, purposes } = require('../../models/superannuation/constants')

exports.list = async function (req, res) {
  const superannuations = await Superannuation.model.find({ pension: true }).populate('company').lean().exec()

  const result = await getSuperannuationObjects(superannuations)
  res.jsonp(result)
}

async function getSuperannuationObjects (superannuations) {
  const monetizeSuperannuations = await monetizedCollection('Superannuations')
  const today = new Date()

  return superannuations.map((superannuation) => {
    const product = {}
    const monetize = monetizeSuperannuations[superannuation._id]
    if (monetize) {
      superannuation.gotoSiteUrl = monetize.applyUrl
      superannuation.gotoSiteEnabled = monetize.enabled
      superannuation.paymentType = monetize.paymentType
    }

    product.uuid = superannuation.uuid
    product.name = superannuation.product_name
    product.segment = getMatchedElment(segments, superannuation.fund_type).name
    product.purpose = getMatchedElment(purposes, superannuation.fund_type).name
    const company = CompanyService.fixLogoUrl(superannuation.company)
    product.logo = company.logo && company.logo.url
    product.memberFee = parseFloat(superannuation.member_fee || 0)
    product['5YearAnnualisedPerformance'] = parseFloat(superannuation['5_year_annualised_performance'] || 0)
    product.basicFee = parseFloat(superannuation.basic_fee || 0)
    const rating = getMatchedElment(ratings, superannuation.rating_image)
    product.rating = rating.name || null
    product.ratingScore = rating.score ? (100 - (rating.score - 1) * 5) : null
    product.productUrl = `/superannuation/${changeCase.paramCase(superannuation.group_name)}/${changeCase.paramCase(superannuation.product_name)}`
    // product.applyUrl = ''
    // product.featured = ''
    product.newFund =  superannuation.startdate ? (today.getFullYear() - superannuation.startdate <= 5) : false
    product.performance = {}
    years.forEach((year) => {
      product.performance[year] = parseFloat(superannuation[`performance_${year}`] || 0) || null
    })
    product.company = {
      name: superannuation.group_name,
    }
    product.basicFee5k = parseFloat(superannuation.basic_fee_5k || 0)
    product.basicFee50k = parseFloat(superannuation.basic_fee || 0)
    product.basicFee100k = parseFloat(superannuation.basic_fee_100k || 0)
    product.basicFee250k = parseFloat(superannuation.basic_fee_250k || 0)
    product.basicFee500k = parseFloat(superannuation.basic_fee_500k || 0)
    product.assetAdminFee = parseFloat(superannuation.asset_admin_fee || 0)
    product.investmentFee = parseFloat(superannuation.investment_fee || 0)
    product.switchingFee = parseFloat(superannuation.switching_fee || 0)
    product.withdrawalFee = parseFloat(superannuation.withdrawal_fee || 0)
    product.acctsizeDiscount = parseFloat(superannuation.acctsize_discount || 0)
    product.empsizeDiscount = parseFloat(superannuation.empsize_discount || 0)
    product.finplanService = superannuation.finplan_service === 'Yes'
    product.healthInsurance = superannuation.health_insurance === 'Yes'
    product.homeLoans = superannuation.home_loans === 'Yes'
    product.creditCards = superannuation.credit_cards === 'Yes'
    product.bindingNominations = superannuation.binding_nominations === 'Yes'
    product.nonLapsingBindingNoms = superannuation.non_lapsing_binding_noms === 'Yes'
    product.insLifeEventIncreases = superannuation.ins_life_event_increases === 'Yes'
    product.antiDetriment = superannuation.anti_detriment === 'Yes'
    product.ltip = superannuation.ltip === 'Yes'
    product.validDate = superannuation.valid_date

    return product
  })
}

function getMatchedElment (arr, source) {
  return _.last(_.filter(arr, (value) => value.regx.test(source))) || {}
}
