var keystone = require('keystone')
var removeUneededFields = require('../../utils/removeUneededFields')
var setPromotedOrder = require('../../utils/helperFunctions').setPromotedOrder

var SavingsAccount = keystone.list('SavingsAccount')
var SavingsAccountTier = keystone.list('SavingsAccountTier')
var CompanySavingsAccount = keystone.list('CompanySavingsAccount')
var monetizedCollection = require('./monetizedCollection')

exports.list = async function (req, res) {
  let savingsAccounts = await SavingsAccount.model.find().populate('company').lean().exec()
  let result = await getSavingAccounts(savingsAccounts)
  res.jsonp(result)
}

async function getSavingAccounts (accounts) {
	const variations = await SavingsAccountTier.model.find().populate('product').lean().exec()
	const companySavingsAccounts = await CompanySavingsAccount.model.find().populate('big4ComparisonProduct').lean().exec()
	const monetizedList = await monetizedCollection('Savings Accounts')

	let result = accounts.map((account, index) => {
		let company = Object.assign({}, account.company)
		account.variations = variations
			.filter((variation) => variation.product.uuid === account.uuid)
			.map((variation) => {
				variation = removeUneededFields(variation, ['product', 'company'])
				if(typeof variation.minimumAmount === 'undefined' || variation.minimumAmount === null) {
					variation.minimumAmount = 0
				}
				if(typeof variation.maximumAmount === 'undefined' || variation.maximumAmount === null) {
					variation.maximumAmount = 99999999
				}
				return variation
			})
		let companyVertical = companySavingsAccounts.filter((companyAccount) => {
			return String(companyAccount.company) === String(account.company._id)
		})[0]

		company.logo = company.logo && company.logo.url
		account.company = company
		account.company.big4ComparisonProductUuid = null
		if (companyVertical && companyVertical.big4ComparisonProduct) {
			account.company.big4ComparisonProductUuid = companyVertical.big4ComparisonProduct.uuid
		}
				// monetize data
		let monetize = monetizedList[account._id]
		account.gotoSiteUrl = monetize ? monetize.applyUrl : null
		account.gotoSiteEnabled = monetize ? monetize.enabled : false
		account.paymentType = monetize ? monetize.paymentType : null

		account.company.hasRepaymentWidget = companyVertical ? companyVertical.hasRepaymentWidget : false
		setPromotedOrder(account)
		return removeUneededFields(account)
	})

	return result
}
