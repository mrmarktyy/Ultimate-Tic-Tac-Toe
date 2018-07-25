var uuid = require('node-uuid')
var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')
var utils = keystone.utils

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
  slug: { type: Types.Text, index: true, initial: true },
})

// ProviderProductName.schema.index({ company: 1, slug: 1 }, { unique: true })

ProviderProductName.relationship({ path: 'homeLoanVariations', ref: 'HomeLoanVariation', refPath: 'providerProductName' })

ProviderProductName.schema.pre('save', async function (next) {
  if (!this.uuid) {
    this.uuid = uuid.v4()
  }
  if (!this.slug) {
    this.slug = utils.slug(this.name.toLowerCase())
  }
  if (utils.slug(this.slug.toLowerCase()) !== this.slug) {
    this.slug = utils.slug(this.slug.toLowerCase())
  }

  await changeLogService(this)
  next()
})

ProviderProductName.defaultColumns = 'name, company, uuid'
ProviderProductName.register()
