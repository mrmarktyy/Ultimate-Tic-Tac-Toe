const keystone = require('keystone')
const Types = keystone.Field.Types
const specialPersonalLoanAttributes = require('../common/SpecialPersonalLoanAttributes')

const PersonalLoanSpecial = new keystone.List('PersonalLoanSpecial', {
  track: true,
})

PersonalLoanSpecial.add(specialPersonalLoanAttributes)
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
    ref: 'PersonalLoan',
    required: false,
    initial: true,
    index: true,
    filters: { company: ':company' },
  },
})

PersonalLoanSpecial.schema.pre('validate', function (next) {
  if (this.startDate > this.endDate) {
    next(Error('Start date cannot be past the end date.'))
  }
  next()
})

PersonalLoanSpecial.schema.pre('save', function (next) {
	if (this.removeSpecialsEndDate) {
    this.endDate = null
  }
	this.removeSpecialsEndDate = undefined
  next()
})

PersonalLoanSpecial.defaultColumns = 'name, type, introText, blurb'
PersonalLoanSpecial.searchFields = 'name, type, introText, blurb'
PersonalLoanSpecial.register()
