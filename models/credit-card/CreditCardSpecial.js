const keystone = require('keystone')
const Types = keystone.Field.Types
const specialAttributes = require('./SpecialAttributes')

const CreditCardSpecial = new keystone.List('CreditCardSpecial', {
  track: true,
})

CreditCardSpecial.add(specialAttributes)
CreditCardSpecial.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    index: true,
  },
  product: {
    type: Types.Relationship,
    ref: 'CreditCard',
    required: false,
    initial: true,
    index: true,
    filters: { company: ':company' },
  },
})

CreditCardSpecial.schema.pre('validate', function (next) {
  if (!!this.endDate && this.startDate > this.endDate) {
    next(Error('Start date cannot be past the end date.'))
  }
  next()
})

CreditCardSpecial.defaultColumns = 'name, type, introText, blurb'
CreditCardSpecial.searchFields = 'name, type, introText, blurb'
CreditCardSpecial.register()
