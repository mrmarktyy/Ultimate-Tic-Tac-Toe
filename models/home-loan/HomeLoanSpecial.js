const keystone = require('keystone')
const Types = keystone.Field.Types
const specialCommonAttributes = require('../common/SpecialCommonAttributes')

const HomeLoanSpecial = new keystone.List('HomeLoanSpecial', {
  track: true,
})

HomeLoanSpecial.add(specialCommonAttributes)
HomeLoanSpecial.add({
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
		required: false,
		initial: true,
		index: true,
		filters: { company: ':company' },
	},
})

HomeLoanSpecial.defaultColumns = 'name, type, introText, blurb'

HomeLoanSpecial.schema.pre('validate', function (next) {
  if (this.startDate > this.endDate) {
    next(Error('Start date cannot be past the end date.'))
  }
  next()
})

HomeLoanSpecial.searchFields = 'name, type, introText, blurb'
HomeLoanSpecial.register()
