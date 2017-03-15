const keystone = require('keystone')
const Types = keystone.Field.Types
const specialCommonAttributes = require('../common/SpecialCommonAttributes')

const PersonalLoanSpecial = new keystone.List('PersonalLoanSpecial', {
  track: true,
})

PersonalLoanSpecial.add(specialCommonAttributes)
PersonalLoanSpecial.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    index: true,
  },
  product: {
    type: Types.Relationship,
    ref: 'HomeLoan',
    required: true,
    initial: true,
    index: true,
    filters: { company: ':company' },
  },
})

PersonalLoanSpecial.defaultColumns = 'name, type, introText, blurb'
PersonalLoanSpecial.searchFields = 'name, type, introText, blurb'
PersonalLoanSpecial.register()
