var keystone = require('keystone');
var Types = keystone.Field.Types;
var availableOptions = require('../attributes/availableOptions')
var PersonalLoan = keystone.list('PersonalLoan');
var PersonaLoanService = require('../../services/PersonalLoanService')
var ComparisonRateCalculator = require('../../services/ComparisonRateCalculator')

var PersonalLoanVariation = new keystone.List('PersonalLoanVariation');

PersonalLoanVariation.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
		noedit: true
	},
	product: {
		type: Types.Relationship,
		ref: 'PersonalLoan',
		// required: true, // this is  a hack to create the variation under a product
		// initial: true,
		index: true,
		// noedit: true,
		filters: {company: ':company'}
	},
	repVariation: {
		type: Types.Select,
		required: true,
		initial: true,
		options: availableOptions.all,
		emptyOption: false,
		default: availableOptions.unknown
	},
	minLoanAmount: {type: Types.Number, required: true, initial: true, min: 0},
	maxLoanAmount: {type: Types.Number, required: true, initial: true, min: 0},
	minVedaScore: {type: Types.Number, min: 0},
	maxVedaScore: {type: Types.Number, max: 1200},
	minLoanTerm: {type: Types.Number, required: true, initial: true, min: 0},
	maxLoanTerm: {type: Types.Number, required: true, initial: true, min: 0},
	minRate: {type: Types.Number, required: true, initial: true, min: 3},
	maxRate: {type: Types.Number, required: true, initial: true},
	introRate: {type: Types.Number, min: 3},
	introTerm: {type: Types.Number, min: 0},
	comparisonRatePersonal: {type: Types.Number, initial: true},
	comparisonRatePersonalManual: {type: Types.Number, initial: true},
	comparisonRateCar: {type: Types.Number, initial: true},
	comparisonRateCarManual: {type: Types.Number, initial: true}
});

PersonalLoanVariation.schema.index({company: 1, product: 1, name: 1}, {unique: true});

PersonalLoanVariation.schema.pre('validate', function (next) {
	if (!this.comparisonRatePersonalManual && !this.comparisonRateCarManual) {
		next(Error('Need to have either Comparision Rate Personal or Comparision Rate Car'));
	}
	if (this.maxRate < this.minRate) {
		next(Error('Max Rate can not be lower than Min Rate'));
	}
	if (this.comparisonRatePersonalManual && this.comparisonRatePersonalManual < this.minRate) {
		next(Error('Comparison Rate Personal Manual can not be lower than Min Rate'));
	}
	if (this.comparisonRateCarManual && this.comparisonRateCarManual < this.minRate) {
		next(Error('Comparison Rate Car Manual can not be lower than Min Rate'));
	}
	if (this.introRate > this.minRate) {
		next(Error('Intro Rate can not be higher than Min Rate'));
	}
	next();
});

PersonalLoanVariation.schema.pre('save', function (next) {
	let thiz = this
	let promise = PersonalLoan.model.find({_id: this.product}).lean().exec();
	promise.then(function (personalLoans) {
		let personalLoan = personalLoans[0]
		let totalMonthlyFee = PersonaLoanService.getTotalMonthlyFee(personalLoan)
		let totalYearlyFee = PersonaLoanService.getTotalYearlyFee(personalLoan)
		if (personalLoan.isPersonalLoan === availableOptions.yes) {
			let totalUpfrontFee = PersonaLoanService.getPersonalLoanUpfrontFee(personalLoan)
			let comparisonRate = ComparisonRateCalculator.calculatePersonalLoanComparisonRate(thiz.minRate, thiz.introRate, thiz.introTerm,
				totalUpfrontFee, totalMonthlyFee, totalYearlyFee, 0)
			thiz.comparisonRatePersonal = comparisonRate
		}
		if (personalLoan.isCarLoan === availableOptions.yes) {
			let totalUpfrontFee = PersonaLoanService.getCarLoanUpfrontFee(personalLoan)
			let comparisonRate = ComparisonRateCalculator.calculateCarlLoanComparisonRate(thiz.minRate, thiz.introRate, thiz.introTerm,
				totalUpfrontFee, totalMonthlyFee, totalYearlyFee, 0)
			thiz.comparisonRateCar = comparisonRate
		}
		next()
	})
});

PersonalLoanVariation.track = true;
PersonalLoanVariation.defaultColumns = 'name, company, product, minLoanAmount, maxLoanAmount, minLoanTerm, maxLoanTerm';
PersonalLoanVariation.register();
