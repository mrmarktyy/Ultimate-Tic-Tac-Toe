var keystone = require('keystone');
var Types = keystone.Field.Types;
var availableOptions = require('../helpers/availableOptions')

var PersonalLoanVariation = new keystone.List('PersonalLoanVariation');

PersonalLoanVariation.add({
  name: {type: Types.Text, required: true, initial: true, index: true},
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
  repVariation: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  minLoanAmount: {type: Types.Number, required: true, initial: true},
  maxLoanAmount: {type: Types.Number, required: true, initial: true},
  minVedaScore: {type: Types.Number},
  maxVedaScore: {type: Types.Number},
  minLoanTerm: {type: Types.Number, required: true, initial: true},
  maxLoanTerm: {type: Types.Number, required: true, initial: true},
  minRate: {type: Types.Number, required: true, initial: true},
  maxRate: {type: Types.Number, required: true, initial: true},
  introRate: {type: Types.Number},
  introTerm: {type: Types.Number},
  comparisonRatePersonal: {type: Types.Number, required: true, initial: true},
	comparisonRatePersonalManual: {type: Types.Number},
	comparisonRateCar: {type: Types.Number, required: true, initial: true},
	comparisonRateCarManual: {type: Types.Number}
});

PersonalLoanVariation.schema.index({company: 1, product: 1, name: 1}, {unique: true});

PersonalLoanVariation.track = true;
PersonalLoanVariation.defaultColumns = 'name, company, product, minLoanAmount, maxLoanAmount, minLoanTerm, maxLoanTerm, CR10k, CR30k';
PersonalLoanVariation.register();
