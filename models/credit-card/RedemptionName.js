var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

var RedemptionName = new keystone.List('RedemptionName', {
    track: true,
})

RedemptionName.add({
  name: { type: Types.Text, required: true, initial: true, index: true },
})
RedemptionName.add(verifiedCommonAttribute)
RedemptionName.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

RedemptionName.schema.index({ name: 1 }, { unique: true })

RedemptionName.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

RedemptionName.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

RedemptionName.defaultColumns = 'name'
RedemptionName.register()
