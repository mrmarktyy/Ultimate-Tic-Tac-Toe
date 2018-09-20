var keystone = require('keystone')
var changeLogService = require('../../services/changeLogService')
var Types = keystone.Field.Types

var CompanyHomeLoan = new keystone.List('CompanyHomeLoan', {
	track: true,
})

CompanyHomeLoan.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		unique: true,
		index: true,
		noedit: true,
	},
	states: {
		type: Types.MultiSelect,
		options: ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'],
		required: true,
		initial: true,
	},
	big4ComparisonProduct: {
		type: Types.Relationship,
		ref: 'HomeLoanVariation',
		required: false,
		filters: {company: ':company'},
	},
	removeBig4ComparisonProduct: {type: Types.Boolean, indent: true, default: false},
	hasRepaymentWidget: {type: Types.Boolean, indent: true, default: false},
	howToApplyBlurb: {type: Types.Code, height: 250, language: 'html'},
	eligibilityBlurb: {type: Types.Code, height: 150, language: 'html'},
  productReview: { type: Types.Url },
	boostScore: { type: Types.Number },
	tier: { type: Types.Select, options: [
    {value: 0, label: 'None'},
    {value: 1, label: '1'},
    {value: 2, label: '2'},
    {value: 3, label: '3'}],
    initial: true, default: 0,
  },
})

CompanyHomeLoan.schema.pre('save', async function (next) {
	if (this.removeBig4ComparisonProduct) {
    this.big4ComparisonProduct = null
  }
  this.removeBig4ComparisonProduct = undefined
	await changeLogService(this)
	next()
})

CompanyHomeLoan.defaultColumns = 'company, states'
CompanyHomeLoan.register()
