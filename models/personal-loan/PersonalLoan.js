var keystone = require('keystone');
var Types = keystone.Field.Types;

var PersonalLoan = new keystone.List('PersonalLoan');

PersonalLoan.add({
	company :{type: Types.Relationship, ref: 'Company'},
	name: {type: String, required: true, index: true},
	CanstarName: {type: String},
	description: {type: String},
	secureType: {type: Types.Select, options: 'Secured, Unsecured', index: false},
	loanType: {type: Types.Key, options: 'Line of Credit, Fully drawn advance', index: true, many: true},
	securityType: {type: Types.Key, options: 'None, Vehicle, House, Deposits, Others', many: true},
	repaymentFrequency: {
		type: Types.Key,
		options: 'Weekly, Fortnightly, Monthly, Quarterly, Semiannually, Annually',
		many: true
	},
	applicationOptions: {
		type: Types.Key,
		options: 'In branch, Online, Mobile lender, Phone, Broker',
		index: true,
		many: true
	},
	// availableTo457VisaHolders: {type: Types.EditableBoolean, default: false},
	minimumIncome: {type: Number},
	minimumYearsAddress: {type: Number},
	employmentStatus: {
		type: Types.Key,
		options: 'Full time, Part time, Contract, Self employed, Sole trader',
		many: true
	},
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
	otherApplicationRestrictionsOrDetails: {type: String},
	otherBenefits: {type: String},
	otherRestrictions: {type: String},
	adminNotes: {type: String}
});

PersonalLoan.defaultColumns = 'name, loanType, secureType';
PersonalLoan.register();
