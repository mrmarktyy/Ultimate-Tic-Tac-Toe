var keystone = require('keystone')
var uuid = require('node-uuid')
var productCommonAttributes = require('../common/ProductCommonAttributes')
var frequency = require('../attributes/frequency')
var availableOptions = require('../attributes/availableOptions')
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')
var utils = keystone.utils
var Types = keystone.Field.Types

var BankAccount = new keystone.List('BankAccount', {
    track: true,
})

BankAccount.add(productCommonAttributes)
BankAccount.add({
	company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    index: true,
    noedit: true,
  },
	legacyCode: { type: Types.Text, index: true },
	minimumOpeningAmount: { type: Types.Number, default: 0 },
	minimumDepositRequiredForFeeFree: { type: Types.Number },
	minimumDepositRequiredForFeeFreeFrequency: { type: Types.Select, options: frequency },
	minimumAgeRestrictions: { type: Types.Number },
	maximumAgeRestrictions: { type: Types.Number },
	linkedAccountRequired: { type: Types.Select, options: availableOptions.all, default: availableOptions.unknown },
	jointApplicationAvailable: { type: Types.Select, options: availableOptions.all, default: availableOptions.yes },
	hasChequeServices: { type: Types.Select, options: availableOptions.all, default: availableOptions.unknown },
	hasAtmAccess: { type: Types.Select, options: availableOptions.all, default: availableOptions.unknown },
	hasEftposFacility: { type: Types.Select, options: availableOptions.all, default: availableOptions.unknown },
	hasInternetBanking: { type: Types.Select, options: availableOptions.all, default: availableOptions.unknown },
	hasPhoneBanking: { type: Types.Select, options: availableOptions.all, default: availableOptions.unknown },
	hasApp: { type: Types.Select, options: availableOptions.all, default: availableOptions.unknown },
	hasBranchAccess: { type: Types.Select, options: availableOptions.all, default: availableOptions.unknown },
	hasOverdraftFacility: { type: Types.Select, options: availableOptions.all, default: availableOptions.unknown },
	accountKeepingFee: { type: Types.Number },
	accountKeepingFeesFrequency: { type: Types.Select, options: frequency },
	internetTransactionFee: { type: Types.Number },
	phoneTransactionFee: { type: Types.Number },
	eftposFee: { type: Types.Number },
	chequeDepositFee: { type: Types.Number },
	chequeDishonourFee: { type: Types.Number },
	overseasEftposFee: { type: Types.Number },
	overseasATMWithdrawalFee: { type: Types.Number },
	foreignTransactionFeeDollars: { type: Types.Number },
	foreignTransactionFeePercent: { type: Types.Number },
	counterDepositFee: { type: Types.Number },
	counterWithdrawalFee: { type: Types.Number },
	freeCounterTransactionCount: { type: Types.Number },
	atmWithdrawalFee: { type: Types.Number },
	hasOtherBankATMWithdrawalFee: { type: Types.Select, options: availableOptions.all, default: availableOptions.unkown },
	hasOtherBankAtmFeeWaiver: { type: Types.Select, options: availableOptions.all, default: availableOptions.unkown },
	otherBankATMWithdrawalFeeWaiverCondition: { type: Types.Text },
	dailyATMwithdrawalLimit: { type: Types.Number },
	networkBankATMFeeWaiver: { type: Types.Boolean, default: false },
	interestCalculationFrequency: { type: Types.Select, options: frequency },
	interestPaymentFrequency: { type: Types.Select, options: frequency },
	minimumBalanceToActivateInterestRate: { type: Types.Number },
	minimumInterestRate: { type: Types.Number },
	maximumInterestRate: { type: Types.Number },
	interestRateDescription: { type: Types.Text },
	smartPaySupport: { type: Types.MultiSelect, options: 'Apple Pay, Android Pay, Samsung Pay' },
	debitCardTypes: { type: Types.Select, options: 'Visa, MasterCard, Amex, Others' },
	uniqueFeatures: { type: Types.TextArray },
	additionalBenefits: { type: Types.TextArray },
	restrictions: { type: Types.TextArray },
})
BankAccount.add(verifiedCommonAttribute)
BankAccount.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })
BankAccount.schema.index({ company: 1, name: 1 }, { unique: true })
BankAccount.schema.index({ company: 1, slug: 1 }, { unique: true })

BankAccount.schema.pre('validate', function (next) {
	if ((this.minimumAgeRestrictions !== undefined) && ((this.maximumAgeRestrictions !== undefined)) && (this.minimumAgeRestrictions > this.maximumAgeRestrictions)) {
    next(Error('Minimum Age Restrictions cannot be greater than Maximum Age Restrictions'))
  }
  next()
})

BankAccount.schema.pre('save', async function (next) {
  if (!this.uuid) {
    this.uuid = uuid.v4()
  }
  if (!this.slug) {
    let slug = utils.slug(this.name.toLowerCase())
    this.slug = slug
  }
  await changeLogService(this)
  next()
})

BankAccount.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

BankAccount.defaultColumns = 'name, company, uuid, slug'
BankAccount.searchFields = 'name, legacyCode'
BankAccount.drilldown = 'company'
BankAccount.register()
