var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var Company = new keystone.List('Company');

Company.add({
	name: {type: Types.Text, required: true, index: true},
	url: {type: Types.Url, initial:true, required: true},
	phone: {type: Types.Number, initial: true, required: true},
	acn: {type: Types.Number},
	acl: {type: Types.Number},
	companyType: {type: Types.Select, options: 'Bank, Mutual, Bank and Mutual, Other'},
	apraCategory: {
		type: Types.Select,
		options: 'Major Bank, Building Society, Other Domestic Bank, Foreign Bank, Mutual'
	},
	APRAReportingEntity: {type: String},
	canstarRecno: {type: String}
});

/**
 * Registration
 */
Company.defaultColumns = 'name, companyType, canstarRecno';
Company.register();
