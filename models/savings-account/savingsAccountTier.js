var availableOptions = require('../attributes/availableOptions')

var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

var SavingsAccount = keystone.list('SavingsAccount')
var SavingsAccountTier = new keystone.List('SavingsAccountTier', {
    track: true,
})

SavingsAccountTier.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    index: true,
    noedit: true,
  },
  product: {
    type: Types.Relationship,
    ref: 'SavingsAccount',
    required: true,
    initial: true,
    index: true,
    noedit: true,
    filters: { company: ':company' },
  },
  name: { type: Types.Text, required: true, initial: true },
  repVariation: {
    type: Types.Select,
    required: true,
    initial: true,
    options: availableOptions.all,
    emptyOption: false,
    default: availableOptions.unknown,
  },
  minimumDeposit: { type: Types.Number, min: 0, initial: true },
  maximumAmount: { type: Types.Number, min: 0 },
  maximumRate: { type: Types.Number, required: true, initial: true },
  baseRate: { type: Types.Number, min: 0, required: true, initial: true },
  bonusRate: { type: Types.Number, min: 0 },
  bonusRateCondition: { type: Types.Text },
  introductoryRate: { type: Types.Number, min: 0 },
  introductoryRateTerm: { type: Types.Number, min: 0 },
})

SavingsAccountTier.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

SavingsAccountTier.schema.index({ company: 1, product: 1, name: 1 }, { unique: true })

SavingsAccount.schema.post('remove', function (next) {
  SavingsAccountTier.model.remove({ product: Object(next._id) }).exec()
})

SavingsAccountTier.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

SavingsAccountTier.defaultColumns = 'baseRate, company, product'
SavingsAccountTier.drilldown = 'company product'
SavingsAccountTier.register()
