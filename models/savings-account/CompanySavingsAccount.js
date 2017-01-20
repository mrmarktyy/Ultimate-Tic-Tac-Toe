var keystone = require('keystone');
var Types = keystone.Field.Types;

var CompanySavingsAccount = new keystone.List('CompanySavingsAccount');

CompanySavingsAccount.add({
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
  blurb: { type: Types.Code, height: 250, language: 'html' },
});

CompanySavingsAccount.schema.pre('validate', function (next) {
  let postcodeArrayLength = this.availablePostcodes.length;
  for (let i = 0; i < postcodeArrayLength; i++) {
    if (this.availablePostcodes[i].length !== 4) {
      next(Error('each available post code need to be exactly 4 digits'));
      break;
    }
  }
  next();
});


CompanySavingsAccount.track = true;
CompanySavingsAccount.defaultColumns = 'company';
CompanySavingsAccount.drilldown = 'company';
CompanySavingsAccount.register();
