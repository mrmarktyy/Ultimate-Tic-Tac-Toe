var keystone = require('keystone')
var uuid = require('node-uuid')
var productCommonAttributes = require('../common/ProductCommonAttributes')
var availableOptions = require('../attributes/availableOptions')
var changeLogService = require('../../services/changeLogService')
var utils = keystone.utils
var Types = keystone.Field.Types

var TermDeposit = new keystone.List('TermDeposit', {track: true}).add(productCommonAttributes).add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
		noedit: true,
	},
	legacyID: { type: Types.Text, index: true },
	accountKeepingFee: { type: Types.Text },
	earlyWithdrawalPenalty: { type: Types.Text },
	otherBenefits: { type: Types.Text },
	otherRestrictions: { type: Types.Text },
	minimumAgeRequirement: { type: Types.Text},
	coveredByGovernmentGuaranteeRestriction: { type: Types.Text},
	noticePeriodToWithdraw: { type: Types.Number, default: 0 },
	jointApplicationAvailable: { type: Types.Select, options: availableOptions.all, default: availableOptions.yes },
	maturityAlertByEmail: { type: Types.Select, options: availableOptions.all, default: availableOptions.yes },
	maturityAlertByPhone: { type: Types.Select, options: availableOptions.all, default: availableOptions.yes },
	automaticMaturityRollover: { type: Types.Select, options: availableOptions.all, default: availableOptions.yes },
	interestPaymentViaOtherInstitution: { type: Types.Select, options: availableOptions.all, default: availableOptions.yes },
	earlyWithdrawalAvailable: { type: Types.Select, options: availableOptions.all, default: availableOptions.yes },
	isCoveredByGovernmentGuarantee: { type: Types.Select, options: availableOptions.all, default: availableOptions.yes },

	interestPaymentFrequencyOptions: { type: Types.Select, options: 'Monthly, Annually, Semi-Annually, Fortnightly, Weekly' },
	interestPaymentMethod: { type: Types.MultiSelect, options: 'Cheque, Direct Credit, Rollover on maturity' },
	accountKeepingFeeFrequency: { type: Types.MultiSelect, options: 'Monthly, Annually, Semi-Annually, Fortnightly, Weekly' },

})

TermDeposit.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })
TermDeposit.schema.index({ company: 1, name: 1 }, { unique: true })
TermDeposit.schema.index({ company: 1, slug: 1 }, { unique: true })

TermDeposit.schema.pre('save', async function (next) {
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

TermDeposit.defaultColumns = 'name, company, uuid, slug'
TermDeposit.searchFields = 'name, legacyID'
TermDeposit.drilldown = 'company'
TermDeposit.register()
