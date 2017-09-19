const keystone = require('keystone')
const Types = keystone.Field.Types

module.exports = {
  name: {type: Types.Text, required: true, initial: true, index: true},
  type: {type: Types.Select, options: ['Cashback', 'Rewards', 'Free Gifts', 'Other'], required: true, initial: true},
  introText: {type: Types.Text, initial: true},
  blurb: {type: Types.Code, height: 250, language: 'html', initial: true},
  startDate: {type: Types.Datetime, required: true, initial: true},
  endDate: {type: Types.Datetime, initial: true},
  SpecialsUrl: {type: Types.Url, initial: true},
	promotedOrder: { type: Types.Select, options: [{ value: '0', label: 'None' }, { value: '1', label: '1 - First' }, 2, 3, 4, 5, 6, 7, 8, 9, 10], default: '0', initial: true },
}
