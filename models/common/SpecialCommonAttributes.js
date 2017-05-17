const keystone = require('keystone')
const Types = keystone.Field.Types

module.exports = {
  name: {type: Types.Text, required: true, index: true},
  type: {type: Types.Select, options: ['Cashback', 'Rewards', 'Free Gifts', 'Other'], required: true, initial: true},
  introText: {type: Types.Text, initial: true},
  blurb: {type: Types.Code, height: 250, language: 'html', initial: true},
  startDate: {type: Types.Datetime, required: true, initial: true},
  endDate: {type: Types.Datetime, required: true, initial: true},
  SpecialsUrl: {type: Types.Text, initial: true},
}
