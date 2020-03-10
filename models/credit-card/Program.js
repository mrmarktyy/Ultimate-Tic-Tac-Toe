var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')
var { imageStorage } = require('../helpers/fileStorage')

var Program = new keystone.List('Program', {
    track: true,
})

Program.add({
  name: { type: Types.Text, required: true, initial: true, index: true },
  shortName: { type: Types.Text, initial: true },
  isReward: { type: Types.Boolean, indent: true, default: false, initial: true },
  isPartner: { type: Types.Boolean, indent: true, default: false, initial: true },
  isFrequentFlyer: { type: Types.Boolean, indent: true, default: false, initial: true },
  icons: imageStorage('creditcardprograms'),
})

Program.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

Program.schema.pre('validate', function (next) {
  if (this.isReward === false && this.isPartner === false) {
    next(Error('Both is reward and is partner cannot be false'))
  }
  if (this.shortName && this.shortName.length > 25) {
    next(Error('Short name has a max of 25 characters'))
  }
  next()
})

Program.add(verifiedCommonAttribute)
Program.schema.index({ name: 1 }, { unique: true })

Program.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

Program.schema.post('save', async function () {
	await verifiedService(this)
})

Program.defaultSort = 'name'
Program.defaultColumns = 'name, shortName, isReward, isPartner, isFrequentFlyer'
Program.register()
