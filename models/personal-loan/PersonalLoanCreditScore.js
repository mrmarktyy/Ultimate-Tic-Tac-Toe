const keystone = require('keystone')
const Types = keystone.Field.Types
const creditScoreCommonAttributes = require('../common/CreditScoreCommonAttributes')

const PersonalLoanCreditScore = new keystone.List('PersonalLoanCreditScore', {
  track: true,
})

PersonalLoanCreditScore.add(creditScoreCommonAttributes)
PersonalLoanCreditScore.add({
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

PersonalLoanCreditScore.defaultColumns = 'qualificationType, employmentStatus'
PersonalLoanCreditScore.register()
