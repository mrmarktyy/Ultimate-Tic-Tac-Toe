var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

var RedemptionType = new keystone.List('RedemptionType', {
    track: true,
})

RedemptionType.add({
  name: { type: Types.Text, required: true, initial: true, index: true },
})

RedemptionType.schema.index({ name: 1 }, { unique: true })

RedemptionType.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

RedemptionType.defaultColumns = 'name'
RedemptionType.register()
