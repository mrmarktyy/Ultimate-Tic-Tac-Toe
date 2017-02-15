var keystone = require('keystone')
var Types = keystone.Field.Types

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
	name: {type: Types.Text, required: true, initial: true},
	description: {type: Types.Text, initial: true},
	duringPeriod: { type: Types.MultiSelect, initial: true, required: true, options: ['VARIABLE', 'FIXED'], emptyOption: false},
	isExtraRepaymentAllow: { type: Types.Boolean, indent: true, default: false },
	feeForExtraRepayment: { type: Types.Number, initial: true},
	maxAmountOfExtraRepaymentInDollar: {type: Types.Text, initial: true},
	maxAmountOfExtraRepaymentInPercentage: {type: Types.Text, initial: true},
	limitPeriod: {
		type: Types.Select,
		options: ['PER_YEAR', 'DURING_FIXED_PERIOD'],
	},
	penaltyFeeIfMaxAmountExceeded: {type: Types.Text, initial: true},
})

ExtraRepayment.defaultColumns = 'name, product, company, duringPeriod, isExtraRepaymentAllow, feeForExtraRepayment'
ExtraRepayment.register()

