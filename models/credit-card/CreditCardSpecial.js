const keystone = require('keystone')
const Types = keystone.Field.Types
const specialCommonAttributes = require('../common/SpecialCommonAttributes')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

const CreditCardSpecial = new keystone.List('CreditCardSpecial', {
  track: true,
})

CreditCardSpecial.add(specialCommonAttributes)
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

CreditCardSpecial.add(verifiedCommonAttribute)

CreditCardSpecial.schema.pre('validate', function (next) {
  if (this.startDate > this.endDate) {
    next(Error('Start date cannot be past the end date.'))
  }
  next()
})

CreditCardSpecial.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

CreditCardSpecial.defaultColumns = 'name, type, introText, blurb'
CreditCardSpecial.searchFields = 'name, type, introText, blurb'
CreditCardSpecial.register()
