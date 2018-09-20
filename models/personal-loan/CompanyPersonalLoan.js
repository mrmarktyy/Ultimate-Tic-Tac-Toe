var keystone = require('keystone')
var Types = keystone.Field.Types
var availableOptions = require('../attributes/availableOptions')
var changeLogService = require('../../services/changeLogService')

var CompanyPersonalLoan = new keystone.List('CompanyPersonalLoan', {
    track: true,
})

CompanyPersonalLoan.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		unique: true,
		index: true,
		noedit: true,
	},
	availablePostcodes: {
		type: Types.TextArray,
		required: true,
		initial: true,
	},
	peer2Peer: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	applyInBranch: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	applyOnline: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	applyByMobileLender: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	applyByPhone: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	applyByBroker: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	availableTo457VisaHolders: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	approvalTime: { type: Types.Number },
	big4ComparisonProduct: {
    type: Types.Relationship,
    ref: 'PersonalLoan',
    required: false,
    filters: {company: ':company'},
  },
  removeBig4ComparisonProduct: {type: Types.Boolean, indent: true, default: false},
  hasRepaymentWidget: {type: Types.Boolean, indent: true, default: false},
	personalLoanBlurb: { type: Types.Code, height: 250, language: 'html' },
	carLoanBlurb: { type: Types.Code, height: 250, language: 'html' },
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

CompanyPersonalLoan.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

CompanyPersonalLoan.schema.pre('validate', function (next) {
	let postcodeArrayLength = this.availablePostcodes.length
	for (let i = 0; i < postcodeArrayLength; i++) {
		if (this.availablePostcodes[i].length !== 4) {
			next(Error('each available post code need to be exactly 4 digits'))
			break
		}
	}
	next()
})

CompanyPersonalLoan.schema.pre('save', async function (next) {
	if (this.removeBig4ComparisonProduct) {
    this.big4ComparisonProduct = null
  }
  this.removeBig4ComparisonProduct = undefined
	await changeLogService(this)
	next()
})

CompanyPersonalLoan.defaultColumns = 'company, applyInBranch, applyOnline, applyByMobileLender, applyByPhone, applyByBroker'
CompanyPersonalLoan.drilldown = 'company'
CompanyPersonalLoan.register()
