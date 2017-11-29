const keystone = require('keystone')
const Types = keystone.Field.Types
const qualificationCommonAttributes = require('../common/QualificationCommonAttributes')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

const PersonalLoanQualification = new keystone.List('PersonalLoanQualification', {
  track: true,
})

PersonalLoanQualification.add(qualificationCommonAttributes)
PersonalLoanQualification.add({
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
PersonalLoanQualification.add(verifiedCommonAttribute)

PersonalLoanQualification.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

PersonalLoanQualification.defaultColumns = 'company, product, qualificationType'
PersonalLoanQualification.register()
