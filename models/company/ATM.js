var keystone = require('keystone')
var Types = keystone.Field.Types
var uniqueValidator = require('mongoose-unique-validator')
var changeLogService = require('../../services/changeLogService')

var ATM = new keystone.List('ATM', {
    track: true,
})

ATM.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    unique: true,
    index: true,
    noedit: true,
  },
  numberOfATMs: {type: Types.Number, required: true, initial: true},
  feeForWithdrawal: {type: Types.Money},
  feeForBalanceEnquiry: {type: Types.Money},
  ATMPartners: {type: Types.Relationship, ref: 'Company', many: true},
})

ATM.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

ATM.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

ATM.schema.plugin(uniqueValidator)
ATM.defaultSort = 'company'
ATM.defaultColumns = 'company, numberOfATMs, feeForWithdrawal, feeForBalanceEnquiry, ATMPartners'
ATM.searchFields = 'company'
ATM.register()
