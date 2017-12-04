var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

var Program = new keystone.List('Program', {
    track: true,
})

Program.add({
  name: { type: Types.Text, required: true, initial: true, index: true },
  isReward: { type: Types.Boolean, indent: true, default: false, initial: true },
  isPartner: { type: Types.Boolean, indent: true, default: false, initial: true },
})

Program.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

Program.schema.pre('validate', function (next) {
  if (this.isReward === false && this.isPartner === false) {
    next(Error('Both is reward and is partner cannot be false'))
  }

  next()
})

Program.add(verifiedCommonAttribute)
Program.schema.index({ name: 1 }, { unique: true })

Program.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

Program.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

Program.defaultColumns = 'name, isReward, isPartner'
Program.register()
