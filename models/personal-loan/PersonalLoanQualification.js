const keystone = require('keystone')
const Types = keystone.Field.Types
const qualificationCommonAttributes = require('../common/QualificationCommonAttributes')

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

PersonalLoanQualification.defaultColumns = 'company, product, qualificationType'
PersonalLoanQualification.register()
