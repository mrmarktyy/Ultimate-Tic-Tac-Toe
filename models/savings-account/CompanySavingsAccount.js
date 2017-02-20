var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

var CompanySavingsAccount = new keystone.List('CompanySavingsAccount', {
    track: true,
})

CompanySavingsAccount.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    unique: true,
    index: true,
    noedit: true,
  },
  availablePostcodes: {
    type: Types.TextArray,
    required: true,
    initial: true,
  },
  blurb: { type: Types.Code, height: 250, language: 'html' },
})

CompanySavingsAccount.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

CompanySavingsAccount.schema.pre('validate', function (next) {
  let postcodeArrayLength = this.availablePostcodes.length
  for (let i = 0; i < postcodeArrayLength; i++) {
    if (this.availablePostcodes[i].length !== 4) {
      next(Error('each available post code need to be exactly 4 digits'))
      break
    }
  }
  next()
})

CompanySavingsAccount.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

CompanySavingsAccount.defaultColumns = 'company'
CompanySavingsAccount.drilldown = 'company'
CompanySavingsAccount.register()
