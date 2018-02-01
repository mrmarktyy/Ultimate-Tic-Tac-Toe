var keystone = require('keystone')
var Types = keystone.Field.Types
var states = require('../attributes/states')
var changeLogService = require('../../services/changeLogService')

var CompanyCreditCard = new keystone.List('CompanyCreditCard', {
    track: true,
})

CompanyCreditCard.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		unique: true,
		index: true,
		noedit: true,
	},
	availableStates: {
		type: Types.MultiSelect,
		options: states,
		required: true,
		initial: true,
	},
	big4ComparisonProduct: {
		type: Types.Relationship,
		ref: 'CreditCard',
		required: false,
		filters: {company: ':company'},
	},
	removeBig4ComparisonProduct: {type: Types.Boolean, indent: true, default: false},
	hasRepaymentWidget: {type: Types.Boolean, indent: true, default: false},
	blurb: { type: Types.Code, height: 250, language: 'html' },
  productReview: { type: Types.Url },
})

CompanyCreditCard.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

CompanyCreditCard.schema.pre('save', async function (next) {
	if (this.removeBig4ComparisonProduct) {
    this.big4ComparisonProduct = null
  }
  this.removeBig4Comparisonproduct = undefined
  await changeLogService(this)
  next()
})

CompanyCreditCard.defaultColumns = 'company, availableStates'
CompanyCreditCard.drilldown = 'company'
CompanyCreditCard.register()
