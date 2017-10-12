var uuid = require('node-uuid')
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
	uuid: { type: Types.Text, noedit: true, index: true, unique: true },
	name: {type: Types.Text, required: true, initial: true},
})

HomeLoanFamily.schema.pre('save', async function (next) {
  if (!this.uuid) {
    this.uuid = uuid.v4()
  }

	await changeLogService(this)
	next()
})

HomeLoanFamily.defaultColumns = 'name, uuid, neo4jId'
HomeLoanFamily.register()

