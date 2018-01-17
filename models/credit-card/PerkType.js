var keystone = require('keystone')
const Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

const PerkType = new keystone.List('PerkType', {
  track: true,
})

PerkType.add({
  name: { type: Types.Text, initial: true, required: true },
  oldname: { type: Types.Text },
  value: { type: Types.Number, initial: true, required: true },
  Assumptions: { type: Types.Text, initial: true },
})

PerkType.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

PerkType.defaultColumns = 'name, value, assumptions'
PerkType.register()
