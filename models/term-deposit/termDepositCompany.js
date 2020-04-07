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
  hasAwardBadge: {type: Types.Boolean, indent: true, default: false},
  boostScore: { type: Types.Number },
  tier: { type: Types.Select, options: [
    {value: 'null', label: 'None'},
    {value: '1', label: '1'},
    {value: '2', label: '2'},
    {value: '3', label: '3'}],
    initial: true, default: 'null',
  },
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
