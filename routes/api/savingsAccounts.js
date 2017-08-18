var keystone = require('keystone')
var removeUneededFields = require('../../utils/removeUneededFields')
var setPromotedOrder = require('../../utils/helperFunctions').setPromotedOrder

var SavingsAccount = keystone.list('SavingsAccount')
var SavingsAccountTier = keystone.list('SavingsAccountTier')
var CompanySavingsAccount = keystone.list('CompanySavingsAccount')

exports.list = async function (req, res) {
  let savingsAccounts = await SavingsAccount.model.find().populate('company').lean().exec()
  let result = await getSavingAccounts(savingsAccounts)
  res.jsonp(result)
}

async function getSavingAccounts (accounts) {
	const variations = await SavingsAccountTier.model.find().populate('product').lean().exec()
	const companySavingsAccounts = await CompanySavingsAccount.model.find().populate('big4ComparisonProduct').lean().exec()

	let result = accounts.map((account, index) => {
		let company = Object.assign({}, account.company)
		account.variations = variations
			.filter((variation) => variation.product.uuid === account.uuid)
			.map((variation) => {
				variation = removeUneededFields(variation, ['product', 'company'])
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
		account.company.hasRepaymentWidget = companyVertical ? companyVertical.hasRepaymentWidget : false
		setPromotedOrder(account)
		return removeUneededFields(account)
	})

	return result
}
