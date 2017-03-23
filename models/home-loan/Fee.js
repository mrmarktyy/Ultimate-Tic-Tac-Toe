var keystone = require('keystone')
var Types = keystone.Field.Types
var feeTypes = require('./feeTypes')
var frequency = require('./paymentFrequencies')
var changeLogService = require('../../services/changeLogService')

var Fee = new keystone.List('Fee', {
	track: true,
})

Fee.add({
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
		filters: {company: ':company'},
	},
	feeType: {
		type: Types.Select,
		options: feeTypes,
		initial: true,
		required: true,
		emptyOption: false,
	},
	frequency: {
		type: Types.Select,
		options: frequency,
		required: true,
		initial: true,
	},
	atCost: {type: Types.Boolean, indent: true, default: false},
	fixedCost: {type: Types.Number, initial: true},
	fixedPercentage: {type: Types.Number, initial: true},
	description: {type: Types.Text},
})

Fee.schema.pre('validate', function (next) {
	if (this.fixedPercentage < 0 || this.fixedPercentage > 100){
		next(Error('Fixed Percentage need to between 0 and 100 inclusive'))
	}
	next()
})

Fee.schema.pre('save', async function (next) {
	await changeLogService(this)
	next()
})

Fee.defaultColumns = 'product, company, feeType, frequency, fixedCost'
Fee.register()

