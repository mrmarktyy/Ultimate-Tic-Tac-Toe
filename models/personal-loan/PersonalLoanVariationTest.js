var keystone = require('keystone')
var Types = keystone.Field.Types
var availableOptions = require('../attributes/availableOptions')
var PersonalLoan = keystone.list('PersonalLoan')
var ComparisonRateCalculator = require('../../services/ComparisonRateCalculator')
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')
var PLConstant = require('../constants/PersonalLoanConstant')

var PersonalLoanVariation = new keystone.List('PersonalLoanVariationTest', {
    track: true,
    map: { name: 'id' },
})

PersonalLoanVariation.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
		noedit: true,
		unique: true
	},
	product: {
		type: Types.Relationship,
		ref: 'PersonalLoan',
		required: true,
		initial: true,
		index: true,
		noedit: true,
		filters: { company: ':company' },
	},
	name: { type: Types.Text, initial: true },

})


PersonalLoanVariation.defaultColumns = 'company, product, '
PersonalLoanVariation.register()
