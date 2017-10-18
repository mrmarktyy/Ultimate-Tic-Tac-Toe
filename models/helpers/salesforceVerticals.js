// Homeloans originally from SORBET were handled on the variation level
var _ = require('lodash')
var genericVerticals = require('../helpers/genericVerticals')

const specificVerticals = {
  'Car Loans': { collection: 'PersonalLoan', findClause: { isCarLoan: 'YES' }, salesforceVertical: 'Car Loans' },
	'Personal Loans': { collection: 'PersonalLoan', findClause: { isPersonalLoan: 'YES' }, salesforceVertical: 'Personal Loans' },
  'Home Loans': { collection: 'HomeLoanVariation', salesforceVertical: 'Home Loans' },
  'Savings Accounts': { collection: 'SavingsAccount', salesforceVertical: 'Savings A/C' },
}

module.exports = _.merge({}, specificVerticals, genericVerticals)
