const keystone = require('keystone')
const changeCase = require('change-case')
const _ = require('lodash')

const Superannuation = keystone.list('Superannuation')
const monetizedCollection = require('./monetizedCollection')
const CompanyService = require('../../services/CompanyService')
const { getYears, ratings, segments, purposes, options } = require('../../models/superannuation/constants')
const recommendedMultiplier = require('../../utils/recommendedMultiplier').multiplier

exports.list = async function (req, res) {
  const pensions = await Superannuation.model.find({ pension: true, isDiscontinued: false }).populate({path: 'fundgroup', populate: {path: 'company'}}).lean().exec()
  const result = await getPensionObjects(pensions)
  res.jsonp(result)
}

async function getPensionObjects (pensions) {
	const monetizePensions = await monetizedCollection('Pension')
	const today = new Date()

	return pensions.map((pension) => {
		const product = {}
		const monetize = monetizePensions[pension._id] || {}
		product.uuid = pension.uuid
		product.name = pension.product_name
		product.segment = getMatchedElment(segments, pension.fund_type).name
		product.purpose = getMatchedElment(purposes, pension.fund_type).name
		product.fy = parseInt(pension.fy)
		product.month = parseInt(pension.month)
		pension.fundgroup.company = Object.assign({}, pension.fundgroup.company)
		product.company = Object.assign({}, CompanyService.fixLogoUrl(pension.fundgroup.company))
		product.company.logo = product.company.logo && product.company.logo.url
		product.memberFee = parseFloat(pension.member_fee || 0)
		product['5YearAnnualisedPerformance'] = parseFloat(pension['5_year_annualised_performance'] || 0)
		product['5YearAnnualisedPerformanceAvg'] = parseFloat(pension['5_year_annualised_performance_avg'] || 0)
		product.basicFee = parseFloat(pension.basic_fee_50k || 0)
		const rating = getMatchedElment(ratings, pension.rating_image)
		product.rating = rating.name || null
		product.ratingScore = rating.score || null
		product.productUrl = pension.productUrl || `/pension-funds/${pension.fundgroup.slug}/${pension.slug}`
		product.applyUrl = Object.keys(monetize).length && monetize.enabled ? monetize.applyUrl : null
		product.paymentType = Object.keys(monetize).length ? monetize.paymentType : null
		product.gotoSiteUrl = Object.keys(monetize).length ? monetize.applyUrl : null
		product.gotoSiteEnabled = Object.keys(monetize).length ? monetize.enabled : null
		product.newFund =  pension.startdate ? (today.getFullYear() - parseInt(pension.startdate) <= 5) : false
		product.performance = {}
		product.performanceAvg = {}
		getYears(product.fy, product.month).forEach((year, index) => {
			options.forEach((option) => {
				const key = changeCase.camelCase(option)
				const dataKey = index === 0 ? 'fytd' : index
				product.performance[key] = product.performance[key] || {}
				product.performanceAvg[key] = product.performanceAvg[key] || {}
				product.performance[key][year] = parseFloat(pension[`performance_${option}_${dataKey}`] || 0)
				product.performanceAvg[key][year] = parseFloat(pension[`performance_${option}_${dataKey}_avg`] || 0)
			})
		})
		product.basicFee5k = parseFloat(pension.basic_fee_5k || 0)
		product.basicFee50k = parseFloat(pension.basic_fee_50k || 0)
		product.basicFee100k = parseFloat(pension.basic_fee_100k || 0)
		product.basicFee250k = parseFloat(pension.basic_fee_250k || 0)
		product.basicFee500k = parseFloat(pension.basic_fee_500k || 0)
		product.industryAvgFee5k = parseFloat(pension.industry_avg_fee_5k || 0)
		product.industryAvgFee50k = parseFloat(pension.industry_avg_fee || 0)
		product.industryAvgFee100k = parseFloat(pension.industry_avg_fee_100k || 0)
		product.assetAdminFee = parseFloat(pension.asset_admin_fee || 0)
		product.investmentFee = parseFloat(pension.investment_fee || 0)
		product.switchingFee = parseFloat(pension.switching_fee || 0)
		product.withdrawalFee = parseFloat(pension.withdrawal_fee || 0)
		product.acctsizeDiscount = pension.acctsize_discount === 'Yes'
		product.empsizeDiscount = pension.empsize_discount === 'Yes'
		product.finplanService = pension.finplan_service === 'Yes'
		product.healthInsurance = pension.health_insurance === 'Yes'
		product.homeLoans = pension.home_loans === 'Yes'
		product.creditCards = pension.credit_cards === 'Yes'
		product.bindingNominations = pension.binding_nominations === 'Yes'
		product.nonLapsingBindingNoms = pension.non_lapsing_binding_noms === 'Yes'
		product.insLifeEventIncreases = pension.ins_life_event_increases === 'Yes'
		product.antiDetriment = pension.anti_detriment === 'Yes'
		product.ltip = pension.ltip === 'Yes'
		product.validDate = pension.valid_date
		product.termDeposits = pension.term_deposits === 'Yes'
		product.intlShares = parseInt(pension.intl_shares || 0)
		product.ausShares = parseInt(pension.aus_shares || 0)
		product.property = parseInt(pension.property || 0)
		product.alternative = parseInt(pension.alternative || 0)
		product.fixedInterest = parseInt(pension.fixed_interest || 0)
		product.cash = parseInt(pension.cash || 0)
		product.other = parseInt(pension.other || 0)
		product.varietyOfOptions = !!(product.intlShares || product.ausShares || product.property ||
			product.alternative || product.fixedInterest || product.cash || product.other !== 100)
		product.deathInsurance = pension.death !== 'na'
		product.incomeProtection = pension.income_protection !== 'na'
		product.advisoryServices = pension.advice !== 'na'
		product.onlineAccess = pension.webmemb_access === 'Yes'
		product.feeScore = parseInt(pension.fee_score || 0)
		product.employer = pension.employer !== 'n/ap'
		product.summary = pension.what_we_say_fund_summary
		product.pros = _.filter([
			pension.pro_1,
			pension.pro_2,
			pension.pro_3,
			pension.pro_4,
			pension.pro_5,
			pension.pro_6,
			pension.pro_7,
			pension.pro_8,
			pension.pro_9,
			pension.pro_10,
			pension.pro_11,
			pension.pro_12,
		], (pro) => pro && pro !== '-')
		product.membership = parseInt(pension.membership || 0)
		product.fundSize = parseInt(pension.total_asset || 0)
		product.yearStarted = parseInt(pension.startdate || 0)
		product.targetMarket = pension.target_market
		product.publicOffer = pension.public_offer === 'Yes'
		product.productType = pension.fund_type
		product.awards = _.map(getMatchedElments(ratings, pension.rating_image), (rating) => (_.pick(rating, ['name', 'url'])))
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
