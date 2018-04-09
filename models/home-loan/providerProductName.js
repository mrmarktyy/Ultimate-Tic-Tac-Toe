var uuid = require('node-uuid')
var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

var ProviderProductName = new keystone.List('ProviderProductName', {
  track: true,
})

ProviderProductName.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    index: true,
    noedit: true,
  },
  uuid: { type: Types.Text, noedit: true, index: true, unique: true },
  name: {type: Types.Text, required: true, initial: true},
})

ProviderProductName.relationship({ path: 'homeLoanVariations', ref: 'HomeLoanVariation', refPath: 'providerProductName' })

ProviderProductName.schema.pre('save', async function (next) {
  if (!this.uuid) {
    this.uuid = uuid.v4()
  }

  await changeLogService(this)
  next()
})

ProviderProductName.defaultColumns = 'name, company, uuid'
ProviderProductName.register()
