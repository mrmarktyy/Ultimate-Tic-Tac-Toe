var keystone = require('keystone')

var Company = keystone.list('Company')
var HomeLoanVariaiton = keystone.list('HomeLoanVariation')
var CompanyHomeLoan = keystone.list('CompanyHomeLoan')
var PersonalLoan = keystone.list('PersonalLoan')
var CompanyPersonalLoan = keystone.list('CompanyPersonalLoan')
var CreditCard = keystone.list('CreditCard')
var SavingsAccounts = keystone.list('SavingsAccount')
var CompanySavingsAccounts = keystone.list('CompanySavingsAccount')
var Superannuation = keystone.list('Superannuation')
var CompanyService = require('../../services/CompanyService')
const MULTIPLIER = 5.32

exports.list = function (req, res) {

	let promise = Company.model.find({ $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] }).lean().exec()
	let response = {}
	let countPromises = []

	promise.then((companies) => {
		companies.forEach((company) => {
			company = CompanyService.fixLogoUrl(company)

			response[company._id] = Object.assign(company, {
				verticals: {
					homeLoans: {},
					personalLoans: {},
					carLoans: {},
					creditCards: {},
					savingsAccounts: {},
					superannuations: {},
				},
			})

			let hlPromise = HomeLoanVariaiton.model.count({
				company: company._id,
			}).exec((err, count) => {
				if (err) return 'database error'
				response[company._id].verticals.homeLoans.count = count
			})
			countPromises.push(hlPromise)

			let companyHlPromise = CompanyHomeLoan.model.findOne({
				company: company._id,
				}).populate('big4ComparisonProduct').lean().exec((err, comp) => {
					if (err) return 'database error'
					if (comp) {
						response[company._id].verticals.homeLoans.hasRepaymentWidget = comp.hasRepaymentWidget
						response[company._id].verticals.homeLoans.big4ComparisonProductUuid = comp.big4ComparisonProduct && comp.big4ComparisonProduct.uuid
					}
				})
			countPromises.push(companyHlPromise)

			let hlccPromise = HomeLoanVariaiton.model
				.find({company: company._id, monthlyClicks: {$gt: 0}})
				.exec((err, results) => {
					let totalClicks = 0
					results.forEach((result) => {
						totalClicks = totalClicks + result.monthlyClicks
					})

					response[company._id].verticals.homeLoans.popularityScore = totalClicks * MULTIPLIER
				})
			countPromises.push(hlccPromise)

			let plPromise = PersonalLoan.model.count({
				company: company._id,
				isPersonalLoan: 'YES',
			}).exec((err, count) => {
				if (err) return 'database error'
				response[company._id].verticals.personalLoans.count = count
			})
			countPromises.push(plPromise)

			let clPromise = PersonalLoan.model.count({
				company: company._id,
				isCarLoan: 'YES',
			}).exec((err, count) => {
				if (err) return 'database error'
				response[company._id].verticals.carLoans.count = count
			})
			countPromises.push(clPromise)

			let plbPromise = CompanyPersonalLoan.model.findOne({
				company: company._id,
			}).populate('big4ComparisonProduct').lean().exec((err, comp) => {
				if (err) return 'database error'
				if (comp) {
					response[company._id].verticals.personalLoans.blurb = comp.personalLoanBlurb || ''
					response[company._id].verticals.personalLoans.big4ComparisonProductUuid = comp.big4ComparisonProduct && comp.big4ComparisonProduct.uuid
					response[company._id].verticals.personalLoans.hasRepaymentWidget = comp.hasRepaymentWidget
					response[company._id].verticals.carLoans.big4ComparisonProductUuid = comp.big4ComparisonProduct && comp.big4ComparisonProduct.uuid
					response[company._id].verticals.carLoans.hasRepaymentWidget = comp.hasRepaymentWidget
					response[company._id].verticals.carLoans.blurb = comp.carLoanBlurb || ''

				}
			})
			countPromises.push(plbPromise)

			let ccPromise = CreditCard.model.count({
				company: company._id,
			}).exec((err, count) => {
				if (err) return 'database error'
				response[company._id].verticals.creditCards.count = count
			})

			let saPromise = SavingsAccounts.model.count({
				company: company._id,
			}).exec((err, count) => {
				if (err) return 'database error'
				response[company._id].verticals.savingsAccounts.count = count
			})
			countPromises.push(saPromise)

			let saCompanyPromise = CompanySavingsAccounts.model.findOne({
				company: company._id,
			}).populate('big4ComparisonProduct').lean().exec((err, comp) => {
				if (err) return 'database error'
				if (comp) {
					response[company._id].verticals.savingsAccounts.blurb = comp.blurb || ''
					response[company._id].verticals.savingsAccounts.big4ComparisonProductUuid = comp.big4ComparisonProduct && comp.big4ComparisonProduct.uuid
					response[company._id].verticals.savingsAccounts.hasRepaymentWidget = comp.hasRepaymentWidget

				}
			})
			countPromises.push(saCompanyPromise)

			let superPromise = Superannuation.model.count({
				company: company._id,
			}).exec((err, count) => {
				if (err) return 'database error'
				response[company._id].verticals.superannuations.count = count
			})
			countPromises.push(superPromise)
		})

		Promise.all(countPromises).then(() => {
			let result = []
			for (let key in response) {
				result.push(response[key])
			}
			res.jsonp(result)
		})
	})

}
