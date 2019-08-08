var keystone = require('keystone')
var uuid = require('node-uuid')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

var Partner = new keystone.List('Partner', {
  track: true,
})

Partner.add({
  name: { type: Types.Text, required: true },
  displayName: { type: Types.Text },
  uuid: { type: Types.Text, noedit: true },
  utmSource: { type: Types.Text, required: true, initial: true },
  apiKey: { type: Types.Text, initial: true },
})

Partner.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

Partner.schema.pre('save', async function (next) {
  if (!this.uuid) {
    this.uuid = uuid.v4()
  }

  await changeLogService(this)
  next()
})

Partner.defaultSort = 'name'
Partner.defaultColumns = 'name, utmSource, apiKey, uuid'
Partner.register()

