var keystone = require('keystone')
var Types = keystone.Field.Types

var HomeLoanVariation = new keystone.List('HomeLoanVariation', {
	track: true,
	map: { name: 'id' },
})

HomeLoanVariation.add({
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
	neo4jId: {type: Types.Number},
	fixMonth: {type: Types.Number, initial: true},
	minTotalLoanAmount: {type: Types.Number, initial: true},
	maxTotalLoanAmount: {type: Types.Number, initial: true},
	minLVR: {type: Types.Number, initial: true},
	maxLVR: {type: Types.Number, initial: true},
	rate: {type: Types.Number, initial: true},
	comparisonRate: {type: Types.Number, initial: true},
	calculatedComparisonRate: {type: Types.Number, initial: true},
	revertRate: {type: Types.Number, initial: true},
	introductoryRate: {type: Types.Number, initial: true},
	introductoryTerm: {type: Types.Number, initial: true},
	revertVariationId: {type: Types.Number, initial: true},
	isStandardVariable: {type: Types.Boolean, indent: true, default: false},
})

HomeLoanVariation.defaultColumns = 'product, company, neo4jId, fixMonth, minLVR, maxLVR, minTotalLoanAmount, maxTotalLoanAmount, rate, comparisonRate'
HomeLoanVariation.register()

