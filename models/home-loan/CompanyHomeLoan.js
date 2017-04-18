var keystone = require('keystone')
var changeLogService = require('../../services/changeLogService')
var Types = keystone.Field.Types

var CompanyHomeLoan = new keystone.List('CompanyHomeLoan', {
	track: true,
})

CompanyHomeLoan.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		unique: true,
		index: true,
		noedit: true,
	},
	states: {
		type: Types.MultiSelect,
		options: ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'],
		required: true,
		initial: true,
	},
	howToApplyBlurb: {type: Types.Code, height: 250, language: 'html'},
	eligibilityBlurb: {type: Types.Code, height: 150, language: 'html'},
})

CompanyHomeLoan.schema.pre('save', async function (next) {
	await changeLogService(this)
	next()
})

CompanyHomeLoan.defaultColumns = 'company, states'
CompanyHomeLoan.register()
