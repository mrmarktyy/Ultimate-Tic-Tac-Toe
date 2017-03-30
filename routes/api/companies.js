var keystone = require('keystone')

var Company = keystone.list('Company')
var HomeLoanVariaiton = keystone.list('HomeLoanVariation')
var PersonalLoan = keystone.list('PersonalLoan')
var CompanyPersonalLoan = keystone.list('CompanyPersonalLoan')
var CreditCard = keystone.list('CreditCard')
var CompanyService = require('../../services/CompanyService')
const MULTIPLIER = 5.32

exports.list = function (req, res) {

	let promise = Company.model.find().lean().exec()
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
				},
			})

			let hlPromise = HomeLoanVariaiton.model.count({
				company: company._id,
			}).exec((err, count) => {
				if (err) return 'database error'
				response[company._id].verticals.homeLoans.count = count
			})
			countPromises.push(hlPromise)

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

			let plbPromise = CompanyPersonalLoan.model.find({
				company: company._id,
			}).lean().exec((err, cp) => {
				if (err) return 'database error'
				if (cp.length > 0) {
					response[company._id].verticals.personalLoans.blurb = cp[0].personalLoanBlurb || ''
					response[company._id].verticals.carLoans.blurb = cp[0].carLoanBlurb || ''
				}
			})
			countPromises.push(plbPromise)

			let ccPromise = CreditCard.model.count({
				company: company._id,
			}).exec((err, count) => {
				if (err) return 'database error'
				response[company._id].verticals.creditCards.count = count
			})
			countPromises.push(ccPromise)

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
