const keystone = require('keystone')
const Types = keystone.Field.Types
const specialCommonAttributes = require('../common/SpecialCommonAttributes')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

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
    ref: 'PersonalLoan',
    required: false,
    initial: true,
    index: true,
    filters: { company: ':company' },
  },
})
PersonalLoanSpecial.add(verifiedCommonAttribute)
PersonalLoanSpecial.schema.pre('validate', function (next) {
  if (this.startDate > this.endDate) {
    next(Error('Start date cannot be past the end date.'))
  }
  next()
})

PersonalLoanSpecial.schema.pre('save', async function (next) {
	if (this.removeSpecialsEndDate) {
    this.endDate = null
  }
	this.removeSpecialsEndDate = undefined
  next()
})

PersonalLoanSpecial.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

PersonalLoanSpecial.defaultColumns = 'name, type, introText, blurb'
PersonalLoanSpecial.searchFields = 'name, type, introText, blurb'
PersonalLoanSpecial.register()
