var keystone = require('keystone')
var Types = keystone.Field.Types
var OffsetAccount = new keystone.List('OffsetAccount')

OffsetAccount.add({
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
	duringPeriod: { type: Types.Select, initial: true, required: true, options: ['VARIABLE', 'FIXED'], emptyOption: false},
	offsetPercentage: { type: Types.Number, initial: true},
	fee: { type: Types.Number, initial: true},
})

OffsetAccount.track = true
OffsetAccount.defaultColumns = 'name, duringPeriod, offsetPercentage, fee'
OffsetAccount.register()

