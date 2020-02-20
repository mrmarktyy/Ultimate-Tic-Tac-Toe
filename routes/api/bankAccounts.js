const keystone = require('keystone')
const removeUneededFields = require('../../utils/removeUneededFields')
const setPromotedOrder = require('../../utils/helperFunctions').setPromotedOrder
const PartnerGotoSite = require('../../services/PartnerGotoSite.js')

const BankAccount = keystone.list('BankAccount')
const CompanyBankAccount = keystone.list('CompanyBankAccount')
const monetizedCollection = require('./monetizedCollection')
const CompanyService = require('../../services/CompanyService')
const recommendedMultiplier = require('../../utils/recommendedMultiplier').multiplier

exports.list = async function (req, res) {
  const bankAccounts = await BankAccount.model.find({ $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] }).populate('company').lean().exec()
  const result = await getBankAccounts(bankAccounts)
  res.jsonp(result)
}

async function getBankAccounts (accounts) {
	const companyBankAccount = await CompanyBankAccount.model.find().lean().exec()
	const monetizedList = await monetizedCollection('Bank Accounts')
  const partnerGotoSite = new PartnerGotoSite('bank-accounts')
  await partnerGotoSite.populatePartners()
	let result = accounts.map((account) => {
		const companyVertical = companyBankAccount.find((companyAccount) => (
			String(companyAccount.company) === String(account.company._id)
		))
		account.companyVertical = removeUneededFields(companyVertical)

		CompanyService.fixLogoUrl(account.company)
		account.company = removeUneededFields(account.company)
		// monetize data
		const monetize = monetizedList[account._id]
		account.gotoSiteUrl = monetize ? monetize.applyUrl : null
    account.gotoSiteEnabled = monetize ? monetize.enabled : false
    account.gotoSiteEnabledPartners = partnerGotoSite.findPartners(account.uuid)
		account.paymentType = monetize ? monetize.paymentType : null
		setPromotedOrder(account)
    account.popularityScore = (account.monthlyClicks ? account.monthlyClicks * recommendedMultiplier : 0)

    delete account.monthlyClicks
		return removeUneededFields(account)
	})

	return result
}
