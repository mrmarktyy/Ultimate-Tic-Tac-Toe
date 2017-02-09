var keystone = require('keystone')
var Types = keystone.Field.Types
var ExtraRepayment = new keystone.List('ExtraRepayment')

ExtraRepayment.add({
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
	duringPeriod: { type: Types.Select, initial: true, required: true, options: ['VARIABLE', 'FIXED'], emptyOption: false},
	isExtraRepaymentAllow: { type: Types.Boolean, indent: true, default: false },
	feeForExtraRepayment: { type: Types.Number, initial: true},
	maxAmountOfExtraRepaymentInDollar: {type: Types.Text, initial: true},
	maxAmountOfExtraRepaymentInPercentage: {type: Types.Text, initial: true},
	penaltyFeeIfMaxAmountExceeded: {type: Types.Text, initial: true},
})

ExtraRepayment.track = true
ExtraRepayment.defaultColumns = 'name, duringPeriod, isExtraRepaymentAllow, feeForExtraRepayment'
ExtraRepayment.register()

