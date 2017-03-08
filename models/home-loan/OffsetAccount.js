var keystone = require('keystone')
var Types = keystone.Field.Types

var OffsetAccount = new keystone.List('OffsetAccount', {
	track: true,
	map: { name: 'id' },
})

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
	name: {type: Types.Text, initial: true},
	description: {type: Types.Text, initial: true},
	duringPeriod: {type: Types.MultiSelect, initial: true, required: true, options: ['VARIABLE', 'FIXED'], emptyOption: false},
	offsetPercentage: {type: Types.Number, initial: true},
})

OffsetAccount.schema.pre('validate', function (next) {
	if (this.offsetPercentage < 0 || this.offsetPercentage > 100){
		next(Error('Offset Percentage need to between 0 and 100 inclusive'))
	}
	next()
})

OffsetAccount.defaultColumns = 'name, product, company, duringPeriod, offsetPercentage'
OffsetAccount.register()

