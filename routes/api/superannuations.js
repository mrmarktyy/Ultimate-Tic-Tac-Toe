const keystone = require('keystone')
const changeCase = require('change-case')
const _ = require('lodash')

const Superannuation = keystone.list('Superannuation')
const monetizedCollection = require('./monetizedCollection')
const CompanyService = require('../../services/CompanyService')
const { getYears, ratings, segments, purposes, options } = require('../../models/superannuation/constants')
const recommendedMultiplier = require('../../utils/recommendedMultiplier').multiplier

exports.list = async function (req, res) {
  const superannuations = await Superannuation.model.find({ superannuation: true, isDiscontinued: false, company: {$exists: true} }).populate({path: 'fundgroup', populate: {path: 'company'}}).lean().exec()
  const result = await getSuperannuationObjects(superannuations)
  res.jsonp(result)
}

async function getSuperannuationObjects (superannuations) {
	const monetizeSuperannuations = await monetizedCollection('Superannuation')
	const today = new Date()

	return superannuations.map((superannuation) => {
		const product = {}
		const monetize = monetizeSuperannuations[superannuation._id] || {}
		product.uuid = superannuation.uuid
		product.name = superannuation.product_name
		product.segment = getMatchedElment(segments, superannuation.fund_type).name
		product.purpose = getMatchedElment(purposes, superannuation.fund_type).name
		product.fy = parseInt(superannuation.fy)
		product.month = parseInt(superannuation.month)
		superannuation.fundgroup.company = Object.assign({}, superannuation.fundgroup.company)
		product.company = Object.assign({}, CompanyService.fixLogoUrl(superannuation.fundgroup.company))
		product.company.logo = product.company.logo && product.company.logo.url
		product.memberFee = parseFloat(superannuation.member_fee || 0)
		product['5YearAnnualisedPerformance'] = parseFloat(superannuation['5_year_annualised_performance'] || 0)
		product['5YearAnnualisedPerformanceAvg'] = parseFloat(superannuation['5_year_annualised_performance_avg'] || 0)
		product.basicFee = parseFloat(superannuation.basic_fee_50k || 0)
		const rating = getMatchedElment(ratings, superannuation.rating_image)
		product.rating = rating.name || null
		product.ratingScore = rating.score || null
		product.productUrl = `/superannuation/${superannuation.fundgroup.slug}/${superannuation.slug}`
		product.applyUrl = Object.keys(monetize).length && monetize.enabled ? monetize.applyUrl : null
		product.paymentType = Object.keys(monetize).length ? monetize.paymentType : null
		product.gotoSiteUrl = Object.keys(monetize).length ? monetize.applyUrl : null
		product.gotoSiteEnabled = Object.keys(monetize).length ? monetize.enabled : null
		product.newFund =  superannuation.startdate ? (today.getFullYear() - parseInt(superannuation.startdate) <= 5) : false
		product.performance = {}
		product.performanceAvg = {}
		getYears(product.fy, product.month).forEach((year, index) => {
			options.forEach((option) => {
				const key = changeCase.camelCase(option)
				const dataKey = index === 0 ? 'fytd' : index
				product.performance[key] = product.performance[key] || {}
				product.performanceAvg[key] = product.performanceAvg[key] || {}
				product.performance[key][year] = parseFloat(superannuation[`performance_${option}_${dataKey}`] || 0)
				product.performanceAvg[key][year] = parseFloat(superannuation[`performance_${option}_${dataKey}_avg`] || 0)
			})
		})
		product.basicFee5k = parseFloat(superannuation.basic_fee_5k || 0)
		product.basicFee50k = parseFloat(superannuation.basic_fee_50k || 0)
		product.basicFee100k = parseFloat(superannuation.basic_fee_100k || 0)
		product.basicFee250k = parseFloat(superannuation.basic_fee_250k || 0)
		product.basicFee500k = parseFloat(superannuation.basic_fee_500k || 0)
		product.industryAvgFee5k = parseFloat(superannuation.industry_avg_fee_5k || 0)
		product.industryAvgFee50k = parseFloat(superannuation.industry_avg_fee || 0)
		product.industryAvgFee100k = parseFloat(superannuation.industry_avg_fee_100k || 0)
		product.assetAdminFee = parseFloat(superannuation.asset_admin_fee || 0)
    product.indirectCostRatio = parseFloat(superannuation.indirect_cost_ratio || 0)
		product.investmentFee = parseFloat(superannuation.investment_fee || 0)
		product.switchingFee = parseFloat(superannuation.switching_fee || 0)
		product.withdrawalFee = parseFloat(superannuation.withdrawal_fee || 0)
		product.acctsizeDiscount = superannuation.acctsize_discount === 'Yes'
		product.empsizeDiscount = superannuation.empsize_discount === 'Yes'
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
		product.termDeposits = superannuation.term_deposits === 'Yes'
		product.intlShares = parseInt(superannuation.intl_shares || 0)
		product.ausShares = parseInt(superannuation.aus_shares || 0)
		product.property = parseInt(superannuation.property || 0)
		product.alternative = parseInt(superannuation.alternative || 0)
		product.fixedInterest = parseInt(superannuation.fixed_interest || 0)
		product.cash = parseInt(superannuation.cash || 0)
		product.other = parseInt(superannuation.other || 0)
		product.varietyOfOptions = !!(product.intlShares || product.ausShares || product.property ||
			product.alternative || product.fixedInterest || product.cash || product.other !== 100)
		product.deathInsurance = superannuation.death !== 'na'
		product.incomeProtection = superannuation.income_protection !== 'na'
		product.advisoryServices = superannuation.advice !== 'na'
		product.onlineAccess = superannuation.webmemb_access === 'Yes'
		product.feeScore = parseInt(superannuation.fee_score || 0)
		product.employer = superannuation.employer !== 'n/ap'
		product.summary = superannuation.what_we_say_fund_summary
		product.pros = _.filter([
			superannuation.pro_1,
			superannuation.pro_2,
			superannuation.pro_3,
			superannuation.pro_4,
			superannuation.pro_5,
			superannuation.pro_6,
			superannuation.pro_7,
			superannuation.pro_8,
			superannuation.pro_9,
			superannuation.pro_10,
			superannuation.pro_11,
			superannuation.pro_12,
		], (pro) => pro && pro !== '-')
		product.membership = parseInt(superannuation.membership || 0)
		product.fundSize = parseInt(superannuation.total_asset || 0)
		product.yearStarted = parseInt(superannuation.startdate || 0)
		product.targetMarket = superannuation.target_market
		product.publicOffer = superannuation.public_offer === 'Yes'
		product.productType = superannuation.fund_type
		product.awards = _.map(getMatchedElments(ratings, superannuation.rating_image), (rating) => (_.pick(rating, ['name', 'url'])))
    product.popularityScore = (product.monthlyClicks ? product.monthlyClicks * recommendedMultiplier : 0)
		delete product.monthlyClicks
    return product
	})
}

function getMatchedElments (arr, source) {
	return _.filter(arr, (value) => value.regx.test(source))
}

function getMatchedElment (arr, source) {
	return _.last(getMatchedElments(arr, source)) || {}
}
