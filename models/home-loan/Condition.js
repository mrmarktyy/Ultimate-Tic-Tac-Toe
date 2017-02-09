var keystone = require('keystone')
var Types = keystone.Field.Types
var frequency = require('../attributes/frequency')
var conditionTypes = require('./conditionTypes')
var Condition = new keystone.List('Condition')

Condition.add({
	product: {
		type: Types.Relationship,
		ref: 'HomeLoan',
		required: true,
		initial: true,
		index: true,
		noedit: true,
		filters: {company: ':company'},
	},
	frequency: {type: Types.Select, options: frequency, required: true, initial: true },
	isWhicheverLower: {type: Types.Boolean, indent: true, default: false},
	maxAmount: {type: Types.Number, initial: true},
	minAmount: {type: Types.Number, initial: true},
	fixAmount: {type: Types.Number, initial: true},
	fixPercentage: {type: Types.Number, initial: true},
	minPercentage: {type: Types.Number, initial: true},
	maxPercentage: {type: Types.Number, initial: true},
	term: {type: Types.Number, initial: true},
	startFrom: {type: Types.Number, initial: true},
	endAt: {type: Types.Number, initial: true},
})

Condition.track = true
Condition.defaultColumns = 'product, frequency, fixAmount, minAmount, maxAmount'
Condition.register()

