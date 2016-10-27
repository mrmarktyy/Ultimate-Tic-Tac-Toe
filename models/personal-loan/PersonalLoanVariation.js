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
  comparisonRatePersonal: {type: Types.Number},
	comparisonRatePersonalManual: {type: Types.Number},
	comparisonRateCar: {type: Types.Number},
	comparisonRateCarManual: {type: Types.Number}
});

PersonalLoanVariation.schema.index({company: 1, product: 1, name: 1}, {unique: true});

PersonalLoanVariation.schema.pre('validate', function (next) {
  if ((this.comparisonRatePersonal == undefined) && (this.comparisonRateCar == undefined)) {
    next(Error('Need to have either Comparision Rate Personal or Comparision Rate Car'));
  }
  if ((this.comparisonRatePersonal !== undefined) && (this.comparisonRateCar !== undefined)) {
    next(Error('Only one needed for Comparision Rate Personal and Comparision Rate Car'));
  }
  if (this.maxRate < this.minRate) {
    next(Error('Max Rate can not be lower than Min Rate'));
  }
  if (this.comparisonRatePersonal < this.minRate) {
    next(Error('Comparison Rate Personal can not be lower than Min Rate'));
  }
  if (this.comparisonRatePersonalManual < this.minRate) {
    next(Error('Comparison Rate Personal Manual can not be lower than Min Rate'));
  }
  if (this.comparisonRateCar < this.minRate) {
    next(Error('Comparison Rate Car can not be lower than Min Rate'));
  }
  if (this.comparisonRateCarManual < this.minRate) {
    next(Error('Comparison Rate Car Manual can not be lower than Min Rate'));
  }
  if (this.introRate > this.minRate) {
    next(Error('Intro Rate can not be higher than Min Rate'));
  }
  next();
});

PersonalLoanVariation.track = true;
PersonalLoanVariation.defaultColumns = 'name, company, product, minLoanAmount, maxLoanAmount, minLoanTerm, maxLoanTerm';
PersonalLoanVariation.register();
