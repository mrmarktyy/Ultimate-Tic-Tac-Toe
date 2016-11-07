var keystone = require('keystone');
var Types = keystone.Field.Types;
var states = require('../attributes/states');

var CompanyCreditCard = new keystone.List('CompanyCreditCard');

CompanyCreditCard.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    unique: true,
    index: true,
    noedit: true
  },
  availableStates: {
    type: Types.MultiSelect,
    options: states,
    required: true,
    initial: true,
  },
});

CompanyCreditCard.track = true;
CompanyCreditCard.defaultColumns = 'company, availableStates';
CompanyCreditCard.drilldown = 'company';
CompanyCreditCard.register();
