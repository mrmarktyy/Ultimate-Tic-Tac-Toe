var keystone = require('keystone')
var uuid = require('node-uuid')
var frequency = require('../attributes/frequency')
var availableOptions = require('../attributes/availableOptions')
var productCommonAttributes = require('../common/ProductCommonAttributes')
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')
var utils = keystone.utils
var Types = keystone.Field.Types

var SavingsAccount = new keystone.List('SavingsAccount', {
    track: true,
})

SavingsAccount.add(productCommonAttributes)

SavingsAccount.add({
  existsOnSorbet: { type: Types.Boolean, indent: true, default: false },
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    index: true,
    noedit: true,
  },
  legacyCode: { type: Types.Text },
  isSpecial: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
  isRCSpecial: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
  offerExpires: { type: Types.Select, options: availableOptions.all, default: availableOptions.unknown },
  ecpc: {type: Types.Number, noedit: true, default: 0},
  otherBenefits: { type: Types.Text },
  otherRestrictions: { type: Types.Text },
  minimumAgeRestrictions: { type: Types.Number, min: 0 },
  maximumAgeRestrictions: { type: Types.Number },
  minimumOpeningDeposit: { type: Types.Number, required: true, initial: true },
  linkedAccountRequired: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
  isOnlineOnly: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
  hasAtmAccess: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
  hasEftposFacility: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
  hasInternetFacility: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
  hasPhoneFacility: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
  hasBranchAccess: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
  accountKeepingFees: { type: Types.Number, min: 0 },
  accountKeepingFeesFrequency: { type: Types.Select, options: frequency },
  internetTransactionFee: { type: Types.Number, min: 0 },
  phoneTransactionFee: { type: Types.Number, min: 0 },
  eftposFee: { type: Types.Number, min: 0 },
  overseasEftposFee: { type: Types.Number, min: 0 },
  overTheCounterDepositFee: { type: Types.Number, min: 0 },
  overTheCounterWithdrawalFee: { type: Types.Number, min: 0 },
  atmWithdrawalFee: { type: Types.Number, min: 0 },
	jointApplicationAvailable: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.yes },
	unlimitedWithdrawals: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.yes },
  monthlyClicks: {type: Types.Number, noedit: true, min: 0, default: 0},
})

SavingsAccount.relationship({ path: 'savingsAccountTiers', ref: 'SavingsAccountTier', refPath: 'product' })
SavingsAccount.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })
SavingsAccount.relationship({ path: 'savingsAccountSpecial', ref: 'SavingsAccountSpecial', refPath: 'product' })

SavingsAccount.schema.index({ company: 1, name: 1 }, { unique: true })
SavingsAccount.schema.index({ company: 1, slug: 1 }, { unique: true })
SavingsAccount.add(verifiedCommonAttribute)
SavingsAccount.schema.pre('validate', function (next) {
  if ((this.offerExpires !== undefined) && (this.offerExpires < new Date())) {
    next(Error('OfferExpires must be greater than today'))
  }
  next()
})

SavingsAccount.schema.pre('save', async function (next) {
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

SavingsAccount.schema.post('save', async function () {
	await verifiedService(this)
})

SavingsAccount.defaultColumns = 'name, company, isMonetized'
SavingsAccount.searchFields = 'name, legacyCode'
SavingsAccount.drilldown = 'company'
SavingsAccount.register()
