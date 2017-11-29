var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

var CompanyBankAccount = new keystone.List('CompanyBankAccount', {
    track: true,
})

CompanyBankAccount.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    unique: true,
    index: true,
    noedit: true,
  },
	companyATM: { type: Types.Text, initial: true },
	networkATM: { type: Types.Text },
	branches: { type: Types.Text },
})
CompanyBankAccount.add(verifiedCommonAttribute)
CompanyBankAccount.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

CompanyBankAccount.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

CompanyBankAccount.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})
CompanyBankAccount.defaultColumns = 'company'
CompanyBankAccount.drilldown = 'company'
CompanyBankAccount.register()
