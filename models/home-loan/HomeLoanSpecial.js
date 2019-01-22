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
  variation: {
    type: Types.Relationship,
    ref: 'HomeLoanVariation',
    required: false,
    initial: true,
    index: true,
    filters: { company: ':company' },
	},
	cashBack: { type: Types.Number },
	bonusFFPoints: { type: Types.Number, label: 'Bonus FF Points' },
	bonusFFPointsPer100kLoan: { type: Types.Number, label: 'Bonus FF Points Per 100' },
	FFRedemptionProgram: {
		type: Types.Relationship,
		ref: 'Program',
		required: false,
		index: true,
		label: 'FF Redemption Program',
	},
})

HomeLoanSpecial.defaultColumns = 'name, type, introText, blurb'

HomeLoanSpecial.schema.pre('validate', function (next) {
  if (this.startDate > this.endDate) {
    next(Error('Start date cannot be past the end date.'))
  }
  next()
})

HomeLoanSpecial.schema.pre('save', function (next) {
	if (this.removeSpecialsEndDate) {
    this.endDate = null
  }
	this.removeSpecialsEndDate = undefined
  next()
})

HomeLoanSpecial.searchFields = 'name, type, introText, blurb'
HomeLoanSpecial.register()
