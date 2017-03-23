var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

var HomeLoanFamily = new keystone.List('HomeLoanFamily', {
	track: true,
})

HomeLoanFamily.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
		noedit: true,
	},
	neo4jId: {type: Types.Number, noedit: true},
	name: {type: Types.Text, required: true, initial: true},
})

HomeLoanFamily.schema.pre('save', async function (next) {
	await changeLogService(this)
	next()
})

HomeLoanFamily.defaultColumns = 'name, neo4jId'
HomeLoanFamily.register()

