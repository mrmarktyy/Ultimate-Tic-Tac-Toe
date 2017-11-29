const keystone = require('keystone')
const Types = keystone.Field.Types
const specialCommonAttributes = require('../common/SpecialCommonAttributes')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

const TermDepositSpecial = new keystone.List('TermDepositSpecial', {
  track: true,
})

TermDepositSpecial.add(specialCommonAttributes)
TermDepositSpecial.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    index: true,
  },
  product: {
    type: Types.Relationship,
    ref: 'TermDeposit',
    required: false,
    initial: true,
    index: true,
    filters: { company: ':company' },
  },
})
TermDepositSpecial.add(verifiedCommonAttribute)
TermDepositSpecial.schema.pre('validate', function (next) {
  if (this.startDate > this.endDate) {
    next(Error('Start date cannot be past the end date.'))
  }
  next()
})

TermDepositSpecial.schema.pre('save', async function (next) {
	if (this.removeSpecialsEndDate) {
    this.endDate = null
  }
	this.removeSpecialsEndDate = undefined
  next()
})

TermDepositSpecial.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

TermDepositSpecial.defaultColumns = 'name, type, introText, blurb'
TermDepositSpecial.searchFields = 'name, type, introText, blurb'
TermDepositSpecial.register()
