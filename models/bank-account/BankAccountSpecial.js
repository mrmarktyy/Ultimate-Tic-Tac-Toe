const keystone = require('keystone')
const Types = keystone.Field.Types
const specialCommonAttributes = require('../common/SpecialCommonAttributes')
var availableOptions = require('../attributes/availableOptions')

const BankAccountSpecials = new keystone.List('BankAccountSpecial', {
	track: true,
})

BankAccountSpecials.add(specialCommonAttributes)
BankAccountSpecials.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
	},
	product: {
		type: Types.Relationship,
		ref: 'BankAccount',
		required: false,
		initial: true,
		index: true,
		filters: { company: ':company' },
	},
	isOngoingSpecial: {
		type: Types.Select,
		options: availableOptions.all,
		default: availableOptions.unknown,
	},
})

BankAccountSpecials.schema.pre('validate', function (next) {
	if (this.startDate > this.endDate) {
		next(Error('Start date cannot be past the end date.'))
	}
	next()
})

BankAccountSpecials.schema.pre('save', function (next) {
	if (this.removeSpecialsEndDate) {
		this.endDate = null
	}
	this.removeSpecialsEndDate = undefined
	next()
})

BankAccountSpecials.defaultColumns = 'name, type, introText, blurb'
BankAccountSpecials.searchFields = 'name, type, introText, blurb'
BankAccountSpecials.register()

