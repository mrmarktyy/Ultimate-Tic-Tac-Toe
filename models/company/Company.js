var keystone = require('keystone');
var Types = keystone.Field.Types;

var Company = new keystone.List('Company');

Company.add({
	name: {type: Types.Text, required: true, index: true},
	displayName: {type: Types.Text, required: true, initial: true},
	shortName: {type: Types.Text},
	parentCompany: {type: Types.Relationship, ref: 'Company'},
	otherNames: {type: Types.TextArray},
	type: {
		type: Types.Select,
		required: true,
		initial: true,
		options: 'Major bank, Regional bank, Foreign bank, Mutual bank, Credit union, Building society, Peer to Peer,  Online lender, Non-bank Lender, Other'
	},
	bank: {type: Boolean},
	mutual: {type: Boolean},
	adi: {type: Boolean},
	abnOrAcn: {type: Types.Number},
	acl: {type: Types.Number},
	afsl: {type: Types.Number},
	legacyCode: {type: Types.Text},
	url: {type: Types.Url, required: true, index: true, initial: true},
	searchKeyword: {type: Types.TextArray},
	logo: {
		type: Types.CloudinaryImage,
		folder: 'company',
		autoCleanup : true
	},
});

Company.track = true;
Company.defaultSort = 'name';
Company.defaultColumns = 'name, url, displayName, code, searchKeyword, createdAt';
Company.searchFields = 'name, url, displayName, code, searchKeyword';
Company.register();
