var keystone = require('keystone');
var uuid = require('node-uuid');
var frequency = require('../helpers/frequency')
var availableOptions = require('../helpers/availableOptions')
var productCommonAttributes = require('../common/ProductCommonAttributes')
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
  repaymentType: {type: Types.Select, initial: true, required: true, options: ['FIXED', 'VARIABLE', 'FIXED AND VARIABLE'], emptyOption: false},
  extraRepayments: {type: Types.Select, initial: true, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  hasRedrawFacility: {type: Types.Select, initial: true, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  securedType: {type: Types.Select, initial: true, required: true, options: ['SECURED', 'UNSECURED'], emptyOption: false},
  applicationFees: {type: Types.Number, initial: true, default: 0},
  ongoingFees: {type: Types.Number, initial: true, default: 0},
  ongoingFeesFrequency: {
    type: Types.Select,
    options: frequency,
    required: true,
    initial: true
  },
	uuid: {type: Types.Text, initial: true, noedit: true}, // this should be unique, however, team don't have the data yet. will make this unique once all data loaded.
  legacyCode: {type: Types.Text},
  docReleaseFees: {type: Types.Number},
  isSecuredByVehicle: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isSecuredByProperty: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isSecuredByDeposit: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  securedByOthers: {type: Types.Text},
  isSpecial: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isRCSpecial: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  specialConditions: {type: Types.Text},
  isRestrictedToCurrentHLCustomer: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  minimumYearsAddress: {type: Number},
  minimumIncome: {type: Number},
  isFullTimeEmploymentAccepted: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isPartTimeEmploymentAccepted: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isContractEmploymentAccepted: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isSelfEmploymentAccepted: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  isSoleTraderAccepted: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  minEmploymentLengthFullTime: {type: Number},
  minEmploymentLengthPartTime: {type: Number},
  minEmploymentLengthContractors: {type: Number},
  minEmploymentLengthSelfEmployed: {type: Number},
  minEmploymentLengthSoleTrader: {type: Number},
  minVedaScore: {type: Number},
  minExperianScore: {type: Number},
  minDunBradstreetScore: {type: Number},
  minYearsNoBankruptcy: {type: Number},
  minYearsGoodCredit: {type: Number},
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
  // repaymentFrequency: { // comment out for now, really need multi select feature in our fork
  //   type: Types.Select,
  //   options: frequency
  // },
  extraRepaymentDollarLimits: {type: Types.Number},
  extraRepaymentDollarLimitsPeriod: {type: Types.Number},
  extraRepaymentPercentageLimits: {type: Types.Number},
  extraRepaymentPercentageLimitsPeriod: {type: Types.Number},
  encumberanceCheckFees: {type: Types.Number},
  isFullyDrawnAdvance: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  redrawActivationFee: {type: Types.Number},
  minRedrawAmount: {type: Types.Number},
  hasEarlyExitPenalty: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  missedPaymentPenalty: {type: Types.Number, default: 0},
  earlyExitPenaltyFee: {type: Types.Number},
  earlyExitPenaltyFeePeriod: {type: Types.Number},
  hasEarlyExitPenaltyFeeVaries: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  otherFees: {type: Types.Text}
});

PersonalLoan.relationship({path: 'personalLoanVariations', ref: 'PersonalLoanVariation', refPath: 'product'});

PersonalLoan.schema.index({company: 1, name: 1}, {unique: true});

PersonalLoan.schema.pre('save', function (next) {
  if (!this.uuid) {
    this.uuid = uuid.v4()
  }
  next();
});

PersonalLoan.track = true;
PersonalLoan.defaultColumns = 'name, company, carLoan, personalLoan, lineOfCredit';
PersonalLoan.drilldown = 'company';
PersonalLoan.register();
