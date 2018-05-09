const keystone = require('keystone')
const Types = keystone.Field.Types

module.exports = {
  employmentStatus: {
    type: Types.MultiSelect,
    options: ['Full Time', 'Part Time', 'Contract', 'Self Employed', 'Sole Trader'],
    required: true,
    initial: true,
  },
  minEmploymentLengthFullTime: { type: Types.Number, initial: true, label: 'min Emp Len Full Time' },
  minEmploymentLengthPartTime: { type: Types.Number, initial: true, label: 'min Emp Len Part Time' },
  minEmploymentLengthContractors: { type: Types.Number, label: 'min Emp Len Contract' },
  minEmploymentLengthSelfEmployed: { type: Types.Number, label: 'min Emp Len Self Employed' },
  minEmploymentLengthSoleTrader: { type: Types.Number, label: 'min Emp Len Sole Trader' },
  isOnProbationAccepted: { type: Types.Boolean, indent: true, default: true },
  minVedaScore: { type: Types.Number },
  minExperianScore: { type: Types.Number },
  minDunBradstreetScore: { type: Types.Number },
  minIncomeRequired: { type: Types.Number },
  isGovernmentIncomeAccepted: { type: Types.Boolean, indent: true, default: true },
  isMoreThan50GovernmentIncomeAccepted: { type: Types.Boolean, indent: true, default: false },
  creditHistoryDefaultsNumberAccepted: { type: Types.Number },
  creditHistoryDefaultsTimeframe: { type: Types.Number },
  creditHistoryBankruptcyDischargedTimeFrame: { type: Types.Number },
  creditHistoryJudgementsNumberAccepted: { type: Types.Number },
  creditHistoryJudgementsTimeframe: { type: Types.Number },
  residency: {
    type: Types.MultiSelect,
    options: ['Australian Citizens', 'Australian PR', 'Other'],
    required: true,
     initial: true,
  },
}
