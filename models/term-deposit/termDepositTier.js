var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

var TermDeposit = keystone.list('TermDeposit')
var TermDepositTier = new keystone.List('TermDepositTier', {track: true}).add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
		noedit: true,
	},
	product: {
		type: Types.Relationship,
		ref: 'TermDeposit',
		required: true,
		initial: true,
		index: true,
		noedit: true,
		filters: { company: ':company' },
	},
	name: { type: Types.Text, required: true, initial: true },
	minimumDeposit: { type: Types.Number, min: 0, initial: true },
	maximumDeposit: { type: Types.Number, min: 0 },
	interestRate: { type: Types.Number, required: true, initial: true },
	minimumTerm: { type: Types.Number, min: 0, required: true, initial: true },
	maximumTerm: { type: Types.Number, min: 0 },
	interestPaymentFrequencyShortTerm: { type: Types.Select, options: 'annually, monthly, semi-annually, quarterly, fortnightly, fortnightly, daily, at maturity' },
	interestPaymentFrequencyLongTerm: { type: Types.Select, options: 'annually, monthly, semi-annually, quarterly, fortnightly, fortnightly, daily, at maturity' },
	interestCalculationFrequency: { type: Types.Select, options: 'annually, monthly, semi-annually, quarterly, fortnightly, fortnightly, daily, at maturity' },
})

TermDepositTier.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

TermDepositTier.schema.index({ company: 1, product: 1, name: 1 }, { unique: true })

TermDeposit.schema.post('remove', (next) => {
	TermDepositTier.model.remove({ product: Object(next._id) }).exec()
})

TermDepositTier.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

TermDepositTier.defaultColumns = 'interestRate, company, product'
TermDepositTier.drilldown = 'company product'
TermDepositTier.register()
