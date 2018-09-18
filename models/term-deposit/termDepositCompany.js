var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

var TermDepositCompany = new keystone.List('TermDepositCompany', {
    track: true,
})

TermDepositCompany.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    unique: true,
    index: true,
    noedit: true,
  },
	removeBig4ComparisonProduct: {type: Types.Boolean, indent: true, default: false, initial: true},
	hasRepaymentWidget: {type: Types.Boolean, indent: true, default: false, initial: true},
  boostScore: { type: Types.Number },
  tier: { type: Types.Select, options: ['1', '2', '3'], initial: true },
	blurb: { type: Types.Code, height: 250, language: 'html' },
})

TermDepositCompany.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

TermDepositCompany.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

TermDepositCompany.defaultColumns = 'company'
TermDepositCompany.drilldown = 'company'
TermDepositCompany.register()
