var keystone = require('keystone')
var Types = keystone.Field.Types
var frequency = require('./paymentFrequencies')
var conditionTypes = require('./conditionTypes')

var Condition = new keystone.List('Condition', {
	track: true,
})

Condition.add({
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
	conditionType: {
		type: Types.Select,
		options: conditionTypes,
		initial: true,
		required: true,
		emptyOption: false
	},
	frequency: {type: Types.Select, options: frequency, initial: true },
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

Condition.schema.pre('validate', function (next) {
	if (this.minAmount > this.maxAmount) {
		next(Error('Max Amount can not less than Min Amount'))
	}
	if (this.minPercentage < 0 || this.minPercentage > 100){
		next(Error('Min Percentage need to between 0 and 100 inclusive'))
	}
	if (this.maxPercentage < 0 || this.maxPercentage > 100){
		next(Error('Max Percentage need to between 0 and 100 inclusive'))
	}
	if (this.minPercentage > this.maxPercentage) {
		next(Error('Max Percentage can not less than Min Percentage'))
	}
	if (this.startFrom > this.endAt) {
		next(Error('Start From can not less than End At'))
	}
	next()
})

Condition.defaultColumns = 'product, company, conditionType, fixAmount, minAmount, maxAmount'
Condition.register()

