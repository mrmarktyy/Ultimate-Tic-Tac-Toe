var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

var RedemptionName = new keystone.List('RedemptionName', {
    track: true,
})

RedemptionName.add({
  name: { type: Types.Text, required: true, initial: true, index: true },
  price: { type: Types.Number, required: true, initial: true },
  priceMethod: { type: Types.Text },
})

RedemptionName.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

RedemptionName.schema.index({ name: 1 }, { unique: true })

RedemptionName.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

RedemptionName.defaultColumns = 'name, price, priceMethod'
RedemptionName.register()
