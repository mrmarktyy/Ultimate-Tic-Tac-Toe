var keystone = require('keystone')
var Types = keystone.Field.Types
var HomeLoanFamily = new keystone.List('HomeLoanFamily')

HomeLoanFamily.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
		noedit: true,
	},
	neo4jId: {type: Types.Number},
	name: {type: Types.Text, required: true, initial: true}
})

HomeLoanFamily.track = true
HomeLoanFamily.defaultColumns = 'name, neo4jId'
HomeLoanFamily.register()

