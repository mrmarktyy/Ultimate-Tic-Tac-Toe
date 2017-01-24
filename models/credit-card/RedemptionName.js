var keystone = require('keystone')
var Types = keystone.Field.Types

var RedemptionName = new keystone.List('RedemptionName')

RedemptionName.add({
  name: { type: Types.Text, required: true, initial: true, index: true },
})

RedemptionName.schema.index({ name: 1 }, { unique: true })
RedemptionName.track = true
RedemptionName.defaultColumns = 'name'
RedemptionName.register()
