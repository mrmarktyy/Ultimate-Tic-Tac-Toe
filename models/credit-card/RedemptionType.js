var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

var RedemptionType = new keystone.List('RedemptionType', {
    track: true,
})

RedemptionType.add({
  name: { type: Types.Text, required: true, initial: true, index: true },
})
RedemptionType.add(verifiedCommonAttribute)
RedemptionType.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

RedemptionType.schema.index({ name: 1 }, { unique: true })

RedemptionType.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

RedemptionType.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

RedemptionType.defaultColumns = 'name'
RedemptionType.register()
