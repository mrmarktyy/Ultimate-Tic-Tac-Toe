var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

var HomeLoanRateChange = new keystone.List('HomeLoanRateChange', {
	track: true,
})

HomeLoanRateChange.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
	},
	rateChange: {
		type: Types.Number,
		required: true,
		initial: true,
	},
	dateAnnounced: {
		type: Types.Datetime,
		initial: true,
		required: true,
	},
	dateEffective: {
		type: Types.Datetime,
		initial: true,
		required: true,
	},
	comment: {
		type: Types.Text,
		initial: true,
		required: false,
	},
})

HomeLoanRateChange.schema.pre('save', async function (next) {
	await changeLogService(this)
	next()
})
HomeLoanRateChange.defaultColumns = 'company, rateChange, dateAnnounced, dateEffective'
HomeLoanRateChange.register()

