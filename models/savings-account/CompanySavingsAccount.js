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
  big4ComparisonProduct: {
    type: Types.Relationship,
    ref: 'SavingsAccount',
    required: false,
    filters: {company: ':company'},
  },
  removeBig4ComparisonProduct: {type: Types.Boolean, indent: true, default: false},
  hasRepaymentWidget: {type: Types.Boolean, indent: true, default: false},
  blurb: { type: Types.Code, height: 250, language: 'html' },
  productReview: { type: Types.Url },
  boostScore: { type: Types.Number },
  tier: { type: Types.Select, options: [
    {value: 0, label: 'None'},
    {value: 1, label: '1'},
    {value: 2, label: '2'},
    {value: 3, label: '3'}],
    initial: true, default: 0,
  },
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
  if (this.removeBig4ComparisonProduct) {
    this.big4ComparisonProduct = null
  }
  this.removeBig4ComparisonProduct = undefined
  await changeLogService(this)
  next()
})

CompanySavingsAccount.defaultColumns = 'company'
CompanySavingsAccount.drilldown = 'company'
CompanySavingsAccount.register()
