var keystone = require('keystone');
var Types = keystone.Field.Types;
var availableOptions = require('../attributes/availableOptions');

var CompanyPersonalLoan = new keystone.List('CompanyPersonalLoan');

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
	blurb: { type: Types.Code, height: 250, language: 'html' },
});

CompanyPersonalLoan.schema.pre('validate', function (next) {
	let postcodeArrayLength = this.availablePostcodes.length;
	for (let i = 0; i < postcodeArrayLength; i++) {
		if (this.availablePostcodes[i].length !== 4) {
			next(Error('each available post code need to be exactly 4 digits'));
			break;
		}
	}
	next();
});

CompanyPersonalLoan.track = true;
CompanyPersonalLoan.defaultColumns = 'company, availableStates, applyInBranch, applyOnline, applyByMobileLender, applyByPhone, applyByBroker';
CompanyPersonalLoan.drilldown = 'company';
CompanyPersonalLoan.register();
