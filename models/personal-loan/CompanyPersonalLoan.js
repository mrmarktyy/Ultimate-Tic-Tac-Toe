var keystone = require('keystone');
var Types = keystone.Field.Types;
var availableOptions = require('../helpers/availableOptions')

var CompanyPersonalLoan = new keystone.List('CompanyPersonalLoan');

CompanyPersonalLoan.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    unique: true,
    index: true,
    noedit: true
  },
  // availableStates: { // comment out for now, really need multi select feature in our fork
  //   type: Types.Relationship,
  //   ref: 'State',
  //   required: true,
  //   initial: true,
  //   many: true
  // },
  peer2Peer: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  applyInBranch: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  applyOnline: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  applyByMobileLender: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  applyByPhone: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  applyByBroker: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  availableTo457VisaHolders: {type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown},
  approvalTime: {type: Types.Number}
});

CompanyPersonalLoan.track = true;
CompanyPersonalLoan.defaultColumns = 'company, availableStates, applyInBranch, applyOnline, applyByMobileLender, applyByPhone, applyByBroker';
CompanyPersonalLoan.drilldown = 'company';
CompanyPersonalLoan.register();
