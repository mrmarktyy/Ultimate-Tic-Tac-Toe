var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

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
  productReview: { type: Types.Url },
  boostScore: { type: Types.Number },
  tier: { type: Types.Select, options: [
    {value: 'null', label: 'None'},
    {value: '1', label: '1'},
    {value: '2', label: '2'},
    {value: '3', label: '3'}],
    initial: true, default: 'null',
  },
})

CompanyBankAccount.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

CompanyBankAccount.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

CompanyBankAccount.defaultColumns = 'company'
CompanyBankAccount.drilldown = 'company'
CompanyBankAccount.register()
