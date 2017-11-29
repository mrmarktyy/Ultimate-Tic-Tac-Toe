const keystone = require('keystone')
const Types = keystone.Field.Types
const specialCommonAttributes = require('../common/SpecialCommonAttributes')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')


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

})
HomeLoanSpecial.add(verifiedCommonAttribute)
HomeLoanSpecial.defaultColumns = 'name, type, introText, blurb'

HomeLoanSpecial.schema.pre('validate', function (next) {
  if (this.startDate > this.endDate) {
    next(Error('Start date cannot be past the end date.'))
  }
  next()
})

HomeLoanSpecial.schema.pre('save', async function (next) {
	if (this.removeSpecialsEndDate) {
    this.endDate = null
  }
	this.removeSpecialsEndDate = undefined
  next()
})

HomeLoanSpecial.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

HomeLoanSpecial.searchFields = 'name, type, introText, blurb'
HomeLoanSpecial.register()
