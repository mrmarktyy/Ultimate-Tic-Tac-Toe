var keystone = require('keystone')
const Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

const EarnRate = new keystone.List('EarnRate', {
  track: true,
})

EarnRate.add({
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
    ref: 'CreditCard',
    required: true,
    initial: true,
    index: true,
    noedit: true,
    filters: {company: ':company'},
  },
  isGenericEarnRate: { type: Boolean, indent: true, default: false },
  pointsEarned: { type: Types.Number, initial: true, require: true, default: 0 },
  spendAt: { type: Types.Text, initial: true, required: true },
  cardType: {
    type: Types.Select,
    options: ['Visa', 'MasterCard', 'AMEX', 'Diners Club', 'Visa & AMEX', 'MasterCard & AMEX'],
    required: true,
    initial: true,
  },
  rangeMinimum: { type: Types.Number },
  rangeMaximum: { type: Types.Number },
  rangeUnit: {
    type: Types.Select,
    options: ['Points', 'Dollars'],
  },
  rangePeriod: {
    type: Types.Select,
    options: ['Monthly', 'Annually'],
  },
})

EarnRate.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

EarnRate.defaultColumns = 'company, product, pointsEarned, cardType, rangeMinimum, rangeMaximum'
EarnRate.register()

