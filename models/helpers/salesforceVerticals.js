var _ = require('lodash')
var genericVerticals = require('../helpers/genericVerticals')

const specificVerticals = {
  'Car Loans': { collection: 'PersonalLoan', findClause: { isCarLoan: 'YES' }, salesforceVertical: 'Car Loans', specificClause: { isCarLoan: 'YES', isPersonalLoan: 'No' } },
  'Bank Accounts': { collection: 'BankAccount', salesforceVertical: 'Bank Accounts' },
  'Credit Cards': { collection: 'CreditCard', salesforceVertical: 'Credit Cards' },
  'Personal Loans': { collection: 'PersonalLoan', findClause: { isPersonalLoan: 'YES' }, salesforceVertical: 'Personal Loans' },
  'Home Loans': { collection: 'HomeLoanVariation', salesforceVertical: 'Home Loans' },
  'Pension': { collection: 'Superannuation', findClause: { pension: true, company: {$ne: null} }, salesforceVertical: 'Pension Funds' },
  'Savings Accounts': { collection: 'SavingsAccount', salesforceVertical: 'Savings A/C' },
  'Superannuation': { collection: 'Superannuation', findClause: { superannuation: true, company: {$ne: null} }, salesforceVertical: 'Superannuation' },
  'Term Deposits': { collection: 'TermDeposit', salesforceVertical: 'Term Deposits' },
}

module.exports = _.merge({}, specificVerticals, genericVerticals)
