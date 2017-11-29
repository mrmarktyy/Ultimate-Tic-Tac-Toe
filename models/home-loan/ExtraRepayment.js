var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

var ExtraRepayment = new keystone.List('ExtraRepayment', {
	track: true,
	map: { name: 'id' },
})

ExtraRepayment.add({
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
		ref: 'HomeLoan',
		required: true,
		initial: true,
		index: true,
		noedit: true,
		filters: { company: ':company' },
	},
	name: {type: Types.Text, initial: true},
	description: {type: Types.Text, initial: true},
	duringPeriod: { type: Types.MultiSelect, initial: true, required: true, options: ['VARIABLE', 'FIXED'], emptyOption: false},
	isExtraRepaymentAllow: { type: Types.Boolean, indent: true, default: true },
	feeForExtraRepayment: { type: Types.Number, initial: true},
	maxAmountOfExtraRepaymentInDollar: {type: Types.Text, initial: true},
	maxAmountOfExtraRepaymentInPercentage: {type: Types.Text, initial: true},
	limitPeriod: {
		type: Types.Select,
		options: ['PER_YEAR', 'DURING_FIXED_PERIOD'],
	},
	penaltyFeeIfMaxAmountExceeded: {type: Types.Text, initial: true},
})

ExtraRepayment.add(verifiedCommonAttribute)
ExtraRepayment.schema.pre('validate', function (next) {
	if (this.maxAmountOfExtraRepaymentInPercentage < 0 || this.maxAmountOfExtraRepaymentInPercentage > 100){
		next(Error('Max Amount of Extra Repayment In Percentage need to between 0 and 100 inclusive'))
	}
	next()
})

ExtraRepayment.schema.pre('save', async function (next) {
	await changeLogService(this)
	next()
})

ExtraRepayment.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

ExtraRepayment.defaultColumns = 'name, product, company, duringPeriod, isExtraRepaymentAllow, feeForExtraRepayment'
ExtraRepayment.register()

