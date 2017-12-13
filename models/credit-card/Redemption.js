var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

var Redemption = new keystone.List('Redemption', {
    track: true,
})

Redemption.add({
	program: {
		type: Types.Relationship,
		ref: 'Program',
		required: true,
		initial: true,
		index: true,
		noedit: false,

	},
	redemptionType: {
		type: Types.Relationship,
		ref: 'RedemptionType',
		required: true,
		initial: true,
		index: true,
		noedit: false,
	},
	redemptionName: {
		type: Types.Relationship,
		ref: 'RedemptionName',
		required: true,
		initial: true,
		index: true,
		noedit: false,
	},
	pointsRequired: {type: Types.Number, min: 0, initial: true, required: true},
})

Redemption.add(verifiedCommonAttribute)
Redemption.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

Redemption.schema.index({program: 1, redemptionType: 1, redemptionName: 1}, {unique: true})

Redemption.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

Redemption.schema.post('save', async function () {
	await verifiedService(this)
})

Redemption.defaultColumns = 'program, redemptionName, pointsRequired'
Redemption.register()
