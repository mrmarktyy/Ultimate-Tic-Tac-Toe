const keystone = require('keystone')
const Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')
const qualificationCommonAttributes = require('../common/QualificationCommonAttributes')

const PersonalLoanQualification = new keystone.List('PersonalLoanQualification', {
  track: true,
})

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
  name: { type: Types.Text },
})
PersonalLoanQualification.add(qualificationCommonAttributes)

PersonalLoanQualification.schema.pre('save', async function (next) {
  let company = await keystone.list('Company').model.findOne({_id: this.company}).lean().exec()
  if (this.product) {
    let product = await keystone.list('PersonalLoan').model.findOne({_id: this.product}).lean().exec()
    this.name = `${company.name} - ${product.name}`
  } else {
    this.name = company.name
  }
  await changeLogService(this)
  next()
})
PersonalLoanQualification.defaultColumns = 'company, product, employmentStatus'
PersonalLoanQualification.register()
