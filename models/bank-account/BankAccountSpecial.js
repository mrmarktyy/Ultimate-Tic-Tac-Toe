const keystone = require('keystone')
const Types = keystone.Field.Types
const specialCommonAttributes = require('../common/SpecialCommonAttributes')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

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
})

BankAccountSpecials.add(verifiedCommonAttribute)
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

BankAccountSpecials.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

BankAccountSpecials.defaultColumns = 'name, type, introText, blurb'
BankAccountSpecials.searchFields = 'name, type, introText, blurb'
BankAccountSpecials.register()

