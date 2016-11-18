var keystone = require('keystone');
var uuid = require('node-uuid');
var frequency = require('../attributes/frequency')
var availableOptions = require('../attributes/availableOptions')
var productCommonAttributes = require('../common/ProductCommonAttributes')
var utils = keystone.utils;
var Types = keystone.Field.Types;

var PersonalLoan = new keystone.List('PersonalLoan');

PersonalLoan.add(productCommonAttributes);

PersonalLoan.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    index: true,
    noedit: true
  },
  isCarLoan: {type: Types.Select, initial: true, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isPersonalLoan: {type: Types.Select, initial: true, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isLineOfCredit: {type: Types.Select, initial: true, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  repaymentType: {type: Types.Select, initial: true, required: true, options: ['FIXED', 'VARIABLE'], emptyOption: false},
  extraRepayments: {type: Types.Select, initial: true, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  hasRedrawFacility: {type: Types.Select, initial: true, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  securedType: {type: Types.Select, initial: true, required: true, options: ['SECURED', 'UNSECURED'], emptyOption: false},
  applicationFeesDollar: {type: Types.Number, initial: true, min: 0},
  applicationFeesPercent: {type: Types.Number, initial: true, min: 0, max: 100},
  ongoingFees: {type: Types.Number, initial: true, default: 0, min: 0},
  ongoingFeesFrequency: {
    type: Types.Select,
    options: frequency,
    required: true,
    initial: true
  },
  legacyCode: {type: Types.Text},
  docReleaseFees: {type: Types.Number, min: 0, initial: true, required: true},
  isSecuredByVehicle: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isSecuredByProperty: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isSecuredByDeposit: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  securedByOthers: {type: Types.Text},
  isSpecial: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isRCSpecial: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  specialConditions: {type: Types.Text},
  isRestrictedToCurrentHLCustomer: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  minimumYearsAddress: {type: Number, min: 0},
  minimumIncome: {type: Number, min: 0},
  isFullTimeEmploymentAccepted: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isPartTimeEmploymentAccepted: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isContractEmploymentAccepted: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isSelfEmploymentAccepted: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isSoleTraderAccepted: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  minEmploymentLengthFullTime: {type: Number, min: 0},
  minEmploymentLengthPartTime: {type: Number, min: 0},
  minEmploymentLengthContractors: {type: Number, min: 0},
  minEmploymentLengthSelfEmployed: {type: Number, min: 0},
  minEmploymentLengthSoleTrader: {type: Number, min: 0},
  minVedaScore: {type: Number, min: 200},
  minExperianScore: {type: Number, min: 0},
  minDunBradstreetScore: {type: Number, min: 0},
  minYearsNoBankruptcy: {type: Number, min: 0},
  minYearsGoodCredit: {type: Number, min: 0},
  otherBenefits: {type: Types.Text},
  otherRestrictions: {type: Types.Text},
  adminNotes: {type: Types.Text},

  isNewCarAllowed: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isUsedCarAllowed: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isMotorcycleAllowed: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isBoatAllowed: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isStudentLoanAllowed: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isDebtConsolidationAllowed: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isRenovationAllowed: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isSharesAllowed: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isHolidaysAllowed: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isMedicalBillAllowed: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isWeddingAllowed: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  otherPurposes: {type: Types.Text},
  repaymentFrequency: {
    type: Types.MultiSelect,
    options: frequency
  },
  extraRepaymentDollarLimits: {type: Types.Number, min: 0},
  extraRepaymentDollarLimitsPeriod: {type: Types.Number, min: 0},
  extraRepaymentPercentageLimits: {type: Types.Number, min: 0, max: 100},
  extraRepaymentPercentageLimitsPeriod: {type: Types.Number, min: 0},
  encumberanceCheckFees: {type: Types.Number, min: 0},
  isFullyDrawnAdvance: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  redrawActivationFee: {type: Types.Number, min: 0},
  minRedrawAmount: {type: Types.Number, min: 0},
  hasEarlyExitPenalty: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  missedPaymentPenalty: {type: Types.Number, default: 0, min: 0, initial: true, required: true},
  earlyExitPenaltyFee: {type: Types.Number, min: 0},
  earlyExitPenaltyFeePeriod: {type: Types.Number, min: 0},
  hasEarlyExitPenaltyFeeVaries: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  otherFees: {type: Types.Text}
});

PersonalLoan.relationship({path: 'personalLoanVariations', ref: 'PersonalLoanVariation', refPath: 'product'});

PersonalLoan.schema.index({company: 1, name: 1}, {unique: true});
PersonalLoan.schema.index({company: 1, slug: 1}, {unique: true});

PersonalLoan.schema.pre('validate', function (next) {
  if ((this.applicationFeesDollar === undefined) && (this.applicationFeesPercent === undefined)) {
    next(Error('Application Fee need to fill in either Dollar or Percent'));
  }
  if ((this.extraRepaymentDollarLimits !== undefined) && (this.extraRepayments !== availableOptions.yes)) {
    next(Error('Extra Repayments must be YES if Extra Repayment Dollar Limits is not empty'));
  }
  if ((this.extraRepaymentDollarLimitsPeriod !== undefined) && (this.extraRepayments !== availableOptions.yes)) {
    next(Error('Extra Repayments must be YES if Extra Repayment Dollar Limits Period is not empty'));
  }
  if ((this.extraRepaymentPercentageLimits !== undefined) && (this.extraRepayments !== availableOptions.yes)) {
    next(Error('Extra Repayments must be YES if Extra Repayment Percentage Limits is not empty'));
  }
  if ((this.extraRepaymentPercentageLimitsPeriod !== undefined) && (this.extraRepayments !== availableOptions.yes)) {
    next(Error('Extra Repayments must be YES if Extra Repayment Percentage Limits Period is not empty'));
  }
  if ((this.extraRepaymentDollarLimits == undefined) !== (this.extraRepaymentDollarLimitsPeriod == undefined)) {
    next(Error('Extra Repayments Dollar limits and Extra Repayment Dollar Limits Period must both empty or not empty'));
  }
  if ((this.extraRepaymentPercentageLimits == undefined) !== (this.extraRepaymentPercentageLimitsPeriod == undefined)) {
    next(Error('Extra Repayments Percentage limits and Extra Repayment Percentage Limits Period must both empty or not empty'));
  }
  next();
});

PersonalLoan.schema.pre('save', function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}
	if (!this.slug) {
		let slug = utils.slug(this.name.toLowerCase());
		this.slug = slug
	}
	next()
});

PersonalLoan.track = true;
PersonalLoan.defaultColumns = 'name, company, carLoan, personalLoan, lineOfCredit';
PersonalLoan.drilldown = 'company';
PersonalLoan.register();
