var keystone = require('keystone')
var uuid = require('node-uuid')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')

var Leaderboard = new keystone.List('Leaderboard', {
    track: true,
})

Leaderboard.add({
	uuid: { type: Types.Text, initial: true, noedit: true, unique: true },
	internalName: { type: Types.Text, required: true, index: true, unique: true, initial: true },
	slug: { type: Types.Text, required: true, index: true, unique: true, initial: true },
	displayName: { type: Types.Text, required: true, initial: true },
	displayOrder: { type: Types.Number, required: true, initial: true },
  ultimateFilterCriteria: { type: Types.Textarea, required: true, initial: true },
  flexibilityWeighting: { type: Types.Number },
	description: { type: Types.Text, initial: true },
	searchCriteria: { type: Types.Text, initial: true },
	filterAttributes: { type: Types.Text, initial: true },
})

Leaderboard.schema.pre('save', async function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}
	await changeLogService(this)
	next()
})

Leaderboard.schema.post('save', async function () {
	await verifiedService(this)
})

Leaderboard.defaultColumns = 'internalName, displayName, description'
Leaderboard.register()
