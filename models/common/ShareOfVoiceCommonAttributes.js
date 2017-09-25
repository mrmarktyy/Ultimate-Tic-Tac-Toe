const keystone = require('keystone')
const Types = keystone.Field.Types

module.exports = {
	shareOfVoiceType: {type: Types.Select, index: true, options: [{value: 'percentage', label: 'Percentage'}, {value: 'count', label: 'Count'}], default: 'percentage'},
	shareOfVoiceValue: {type: Types.Text, index: true},
	shareOfVoiceMatrix: {type: Types.Select, index: true, options: [
		{value: 'impression', label: 'Impressions'},
		{value: 'interactions', label: 'Interactions'},
		{value: 'lead', label: 'Leads'},
		{value: 'app', label: 'Apps'},
		{value: 'yield', label: 'Yield'},
		{value: 'budget', label: 'Budget Consumption'},
	], default: 'impression'},
}
