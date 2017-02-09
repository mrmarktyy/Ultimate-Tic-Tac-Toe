var keystone = require('keystone')
var Types = keystone.Field.Types
var RedrawFacility = new keystone.List('RedrawFacility')

RedrawFacility.add({
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
	isUnlimitedRedraw: { type: Types.Boolean, indent: true, default: false },
	minRedrawAmount: { type: Types.Number, initial: true},
	maxRedrawAmount: { type: Types.Number, initial: true},
	feeToActivateRedraw: { type: Types.Number, initial: true},
})

RedrawFacility.track = true
RedrawFacility.defaultColumns = 'name, duringPeriod, isUnlimitedRedraw'
RedrawFacility.register()

