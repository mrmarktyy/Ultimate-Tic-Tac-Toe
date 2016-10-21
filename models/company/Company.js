var keystone = require('keystone');
var Types = keystone.Field.Types;
var imageStorage = require('../helpers/fileStorage')

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
  abnOrAcn: {type: Types.Number},
  acl: {type: Types.Number},
  afsl: {type: Types.Number},
	legacyCode: {type: Types.Text, unique: true},
  url: {type: Types.Url, required: true, index: true, initial: true},
  searchKeyword: {type: Types.TextArray},
  logo: imageStorage('company'),
});

Company.relationship({ path: 'ATMs', ref: 'ATM', refPath: 'company' });
Company.relationship({ path: 'Branches', ref: 'Branch', refPath: 'company' });

Company.track = true;
Company.defaultSort = 'name';
Company.defaultColumns = 'name, url, displayName, code, searchKeyword, createdAt';
Company.searchFields = 'name, url, displayName, code, searchKeyword';
Company.register();
