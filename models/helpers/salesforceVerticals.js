// Homeloans originally from SORBET were handled on the variation level
var _ = require('lodash')
var genericVerticals = require('../helpers/genericVerticals')

const specificVerticals = {
  'Car Loans': { collection: 'PersonalLoan', findClause: { isCarLoan: 'YES' } },
	'Personal Loans': { collection: 'PersonalLoan', findClause: { isPersonalLoan: 'YES' } },
  'Home Loans': { collection: 'HomeLoanVariation' },
}

module.exports = _.merge({}, specificVerticals, genericVerticals)
