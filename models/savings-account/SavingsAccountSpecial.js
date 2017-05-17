const keystone = require('keystone')
const Types = keystone.Field.Types
const specialCommonAttributes = require('../common/SpecialCommonAttributes')

const SavingsAccountSpecial = new keystone.List('SavingsAccountSpecial', {
  track: true,
})

SavingsAccountSpecial.add(specialCommonAttributes)
SavingsAccountSpecial.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    index: true,
  },
  product: {
    type: Types.Relationship,
    ref: 'SavingsAccount',
    required: false,
    initial: true,
    index: true,
    filters: { company: ':company' },
  },
})

SavingsAccountSpecial.schema.pre('validate', function (next) {
  if (this.startDate > this.endDate) {
    next(Error('Start date cannot be past the end date.'))
  }
  next()
})

SavingsAccountSpecial.defaultColumns = 'name, type, introText, blurb'
SavingsAccountSpecial.searchFields = 'name, type, introText, blurb'
SavingsAccountSpecial.register()
