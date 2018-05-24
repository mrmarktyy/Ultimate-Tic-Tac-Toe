var keystone = require('keystone')
var Types = keystone.Field.Types
var featureTypes = require('./featureTypes')
var changeLogService = require('../../services/changeLogService')

var Feature = new keystone.List('Feature', {
	track: true,
})

Feature.add({
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
	featureBand: {
		type: Types.Select,
		options: ['GENERAL', 'VARIABLE', 'FIXED'],
		initial: true,
		required: true,
		emptyOption: false,
	},
	featureType: {
		type: Types.Select,
		options: featureTypes,
		initial: true,
		required: true,
		emptyOption: false,
	},
	isAffectComparisonRate: {type: Types.Boolean, indent: true, default: false},
	isGreenHomeLoan: {type: Types.Boolean, indent: true, default: false},
	noOfFreeElectronicTransactions: {type: Types.Text},
	term: {type: Types.Number, initial: true},
	maxAmount: {type: Types.Number, initial: true},
	minAmount: {type: Types.Number, initial: true},
})

Feature.schema.pre('validate', function (next) {
	if (this.minAmount > this.maxAmount) {
		next(Error('Max Amount can not less than Min Amount'))
	}
	next()
})

Feature.schema.pre('save', async function (next) {
	await changeLogService(this)
	next()
})

Feature.defaultColumns = 'product, company, featureBand, featureType, isAffectComparisonRate'
Feature.register()

