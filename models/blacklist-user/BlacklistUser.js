var keystone = require('keystone')
var uuid = require('node-uuid')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')

var BlacklistUser = new keystone.List('BlacklistUser', {
	track: true,
})

BlacklistUser.add({
	uuid: {type: Types.Text, initial: true, noedit: true, unique: true},
	sourceType: {type: Types.Select, required: true, options: ['Email', 'Phone', 'IP Address'], initial: true},
	value: {type: Types.Text, required: true, initial: true},
	category: {type: Types.Select, required: true, options: ['Spam', 'Internal', 'Bot'], initial: true},
})

BlacklistUser.schema.pre('save', async function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}
	await changeLogService(this)
	next()
})

BlacklistUser.schema.post('save', async function () {
	await verifiedService(this)
})

BlacklistUser.defaultColumns = 'uuid, sourceType, value, category'
BlacklistUser.register()
