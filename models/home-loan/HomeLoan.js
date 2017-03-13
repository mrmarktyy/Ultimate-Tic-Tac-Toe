var keystone = require('keystone')
var uuid = require('node-uuid')
var frequency = require('./paymentFrequencies')
var availableOptions = require('../attributes/availableOptions')
var productCommonAttributes = require('../common/ProductCommonAttributes')
var Types = keystone.Field.Types

var HomeLoan = new keystone.List('HomeLoan', {
	track: true,
})

HomeLoan.add(productCommonAttributes)

HomeLoan.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
		noedit: true,
	},
	homeLoanFamily: {
		type: Types.Relationship,
		ref: 'HomeLoanFamily',
		initial: true,
		index: true,
		filters: { company: ':company' },
	},
	neo4jId: {type: Types.Number, noedit: true},
	homeLoanType: { type: Types.Select, initial: true, required: true, options: ['VARIABLE', 'FIXED'], emptyOption: false },
	isPackage: { type: Types.Boolean, indent: true, default: false },
	isBasicVariable: { type: Types.Boolean, indent: true, default: false },
	isRCSpecial: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	availableTo457VisaHolders: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	isCombinationLoan: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	repaymentFrequencies: { type: Types.MultiSelect, options: frequency, required: true, initial: true },
	applicationOptions: {
		type: Types.MultiSelect,
		options: ['ONLINE', 'IN_BRANCH', 'PHONE', 'MOBILE_BROKER', 'BROKER'],
		required: true,
		initial: true,
	},
	propertyPurposeTypes: {
		type: Types.MultiSelect,
		options: ['OWNER_OCCUPIED', 'INVESTMENT'],
		required: true,
		initial: true,
	},
	repaymentTypes: {
	type: Types.MultiSelect,
		options: ['INTEREST_ONLY', 'PRINCIPAL_AND_INTEREST'],
		required: true,
		initial: true,
	},
	description: { type: Types.Text },
	otherBenefits: { type: Types.Text },
	otherRestrictions: { type: Types.Text },
	adminNotes: { type: Types.Text },
})

HomeLoan.relationship({ path: 'homeLoanVariations', ref: 'HomeLoanVariation', refPath: 'product' })
HomeLoan.relationship({ path: 'offsetAccounts', ref: 'OffsetAccount', refPath: 'product' })
HomeLoan.relationship({ path: 'extraRepayments', ref: 'ExtraRepayment', refPath: 'product' })
HomeLoan.relationship({ path: 'redrawFacilities', ref: 'RedrawFacility', refPath: 'product' })
HomeLoan.relationship({ path: 'fees', ref: 'Fee', refPath: 'product' })
HomeLoan.relationship({ path: 'features', ref: 'Feature', refPath: 'product' })
HomeLoan.relationship({ path: 'conditions', ref: 'Condition', refPath: 'product' })

HomeLoan.schema.pre('save', async function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}

	next()
})

HomeLoan.defaultColumns = 'name, company, homeLoanType, propertyPurposeTypes, repaymentTypes'
HomeLoan.register()
