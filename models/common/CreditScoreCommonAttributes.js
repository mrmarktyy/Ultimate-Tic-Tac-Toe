const keystone = require('keystone')
const Types = keystone.Field.Types

module.exports = {
  qualificationType: {
    type: Types.Select,
    options: ['Subject To Credit', 'Pre Approval'],
    required: true,
    initial: true,
  },
  employmentStatus: {
    type: Types.Select,
    options: ['Full Time', 'Part Time', 'Contract', 'Self Employed', 'Sole Trader'],
    required: true,
    initial: true,
  },
  minEmploymentLengthFullTime: { type: Types.Number, initial: true, label: 'min Emp Len Full Time' },
  minEmploymentLengthPartTime: { type: Types.Number, initial: true, label: 'min Emp Len Part Time' },
  minEmploymentLengthContractors: { type: Types.Number, label: 'min Emp Len Contract' },
  minEmploymentLengthSelfEmployed: { type: Types.Number, label: 'min Emp Len Self Employed' },
  minEmploymentLengthSoleTrader: { type: Types.Number, label: 'min Emp Len Sole Trader' },
  minVedaScore: { type: Types.Number },
  minExperianScore: { type: Types.Number },
  minDunBradstreetScore: { type: Types.Number },
  minYearsNoBankruptcy: { type: Types.Number },
  minYearsGoodCredit: { type: Types.Number },
  minIncomeRequired: { type: Types.Number },
  maxLoanIncomeRatio: { type: Types.Number },
}
