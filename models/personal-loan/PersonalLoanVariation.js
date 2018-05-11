var keystone = require('keystone')
var Types = keystone.Field.Types
var availableOptions = require('../attributes/availableOptions')
var PersonalLoan = keystone.list('PersonalLoan')
var ComparisonRateCalculator = require('../../services/ComparisonRateCalculator')
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')
var PLConstant = require('../constants/PersonalLoanConstant')

var PersonalLoanVariation = new keystone.List('PersonalLoanVariation', {
    track: true,
    map: { name: 'id' },
})

PersonalLoanVariation.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
		noedit: true,
	},
	product: {
		type: Types.Relationship,
		ref: 'PersonalLoan',
		required: true,
		initial: true,
		index: true,
		noedit: true,
		filters: { company: ':company' },
	},
	name: { type: Types.Text, initial: true },
	repVariation: {
		type: Types.Select,
		required: true,
		initial: true,
		options: availableOptions.all,
		emptyOption: false,
		default: availableOptions.unknown,
	},
	minLoanAmount: { type: Types.Number, required: true, initial: true, min: 0 },
	maxLoanAmount: { type: Types.Number, required: true, initial: true, min: 0 },
	minVedaScore: { type: Types.Number, min: 0 },
	maxVedaScore: { type: Types.Number, max: 1200 },
	minLoanTerm: { type: Types.Number, required: true, initial: true, min: 0 },
	maxLoanTerm: { type: Types.Number, required: true, initial: true, min: 0 },
	minRate: { type: Types.Number, required: true, initial: true, min: 3 },
	maxRate: { type: Types.Number, required: true, initial: true },
	introRate: { type: Types.Number, min: 0 },
	introTerm: { type: Types.Number, min: 0 },
	comparisonRatePersonal: { type: Types.Number, noedit: true },
	comparisonRatePersonalManual: { type: Types.Number, initial: true },
	comparisonRatePersonal5Years: { type: Types.Number, noedit: true, label: 'Comp Pl 5Yrs' },
	comparisonRatePersonalManual5Years: { type: Types.Number, initial: true, label: 'Comp Pl 5Yrs Manual' },
	comparisonRateCar: { type: Types.Number, noedit: true },
	comparisonRateCarManual: { type: Types.Number, initial: true },
  applicationFeesDollar: { type: Types.Number, initial: true, min: 0 },
  applicationFeesPercent: { type: Types.Number, initial: true, min: 0, max: 100 },
  hasHomeOwnersDiscount: { type: Types.Boolean, indent: true, default: false },
	isMarketplaceParticipant: { type: Types.Boolean, indent: true, default: false },

})
PersonalLoanVariation.add(verifiedCommonAttribute)
PersonalLoanVariation.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

PersonalLoanVariation.schema.pre('validate', function (next) {
	if (this.maxRate < this.minRate) {
		next(Error('Max Rate can not be lower than Min Rate'))
	}
	if (this.comparisonRatePersonalManual && this.comparisonRatePersonalManual < this.minRate) {
		next(Error('Comparison Rate Personal Manual can not be lower than Min Rate'))
	}
	if (this.comparisonRateCarManual && this.comparisonRateCarManual < this.minRate) {
		next(Error('Comparison Rate Car Manual can not be lower than Min Rate'))
	}
	if (this.introRate > this.minRate) {
		next(Error('Intro Rate can not be higher than Min Rate'))
	}
	let thiz = this
	let promise = PersonalLoan.model.find({ _id: this.product }).lean().exec()
	promise.then((personalLoans) => {
		let personalLoan = personalLoans[0]
		if (personalLoan.isPersonalLoan === availableOptions.no && thiz.comparisonRatePersonalManual) {
			next(Error('This product is not for personal loan, can not have a personal loan comparison rate'))
		}
		if (personalLoan.isCarLoan === availableOptions.no && thiz.comparisonRateCarManual) {
			next(Error('This product is not for car loan, can not have a car loan comparison rate'))
		}
		next()
	})
})

PersonalLoanVariation.schema.pre('save', async function (next) {
	let personalLoans = await PersonalLoan.model.find({ _id: this.product }).exec()
	personalLoans.forEach((personalLoan) => {
		let loan = {
		yearlyRate: this.minRate,
		yearlyIntroRate: this.introRate,
		introTermInMonth: this.introTerm,
		totalMonthlyFees: personalLoan.totalMonthlyFee,
		totalYearlyFees: personalLoan.totalYearlyFee,
		}
		if (personalLoan.isPersonalLoan === availableOptions.yes) {
			loan.totalUpfrontFees = personalLoan.personalLoanTotalUpfrontFee
			this.comparisonRatePersonal = ComparisonRateCalculator.calculatePersonalLoanComparisonRate(loan)
			let loan5Years = Object.assign(
				{},
				loan,
				{
					loanAmount: PLConstant.PERSONAL_LOAN_30000_LOAN_AMOUNT,
					loanTermInMonth: PLConstant.PERSONAL_LOAN_5YEAR_LOAN_TERM,
					totalUpfrontFees: personalLoan.personalLoanTotalUpfrontFee30000,
				}
			)
			this.comparisonRatePersonal5Years = ComparisonRateCalculator.calculatePersonalLoanComparisonRate(loan5Years)
		} else {
			this.comparisonRatePersonal = null
			this.comparisonRatePersonal5Years = null
		}
		if (personalLoan.isCarLoan === availableOptions.yes) {
			loan.totalUpfrontFees = personalLoan.carLoanTotalUpfrontFee
			this.comparisonRateCar = ComparisonRateCalculator.calculateCarlLoanComparisonRate(loan)
		} else {
			this.comparisonRateCar = null
		}
		next()
	})
})

PersonalLoan.schema.post('remove', (next) => {
	PersonalLoanVariation.model.remove({ product: Object(next._id) }).exec()
})

PersonalLoanVariation.schema.pre('save', async function (next) {
	await changeLogService(this)
	next()
})

PersonalLoanVariation.schema.post('save', async function () {
	await verifiedService(this)
})

PersonalLoanVariation.defaultColumns = 'name, company, product, minLoanAmount, maxLoanAmount, minLoanTerm, maxLoanTerm, comparisonRatePersonal, comparisonRatePersonalManual, comparisonRateCar, comparisonRateCarManual'
PersonalLoanVariation.register()
