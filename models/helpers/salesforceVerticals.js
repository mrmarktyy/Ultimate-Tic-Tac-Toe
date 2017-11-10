var _ = require('lodash')
var genericVerticals = require('../helpers/genericVerticals')
var specificVerticals

if (process.env.SALESFORCE_BANKACCOUNTLIVE === 'True') {
  specificVerticals = {
    'Car Loans': { collection: 'PersonalLoan', findClause: { isCarLoan: 'YES' }, salesforceVertical: 'Car Loans' },
    'Bank Accounts': { collection: 'BankAccount', salesforceVertical: 'Bank Accounts' },
    'Personal Loans': { collection: 'PersonalLoan', findClause: { isPersonalLoan: 'YES' }, salesforceVertical: 'Personal Loans' },
    'Home Loans': { collection: 'HomeLoanVariation', salesforceVertical: 'Home Loans' },
    'Pension': { collection: 'Superannuation', findClause: { pension: true, company: {$ne: null} }, salesforceVertical: 'Pension Funds' },
    'Savings Accounts': { collection: 'SavingsAccount', salesforceVertical: 'Savings A/C' },
    'Superannuation': { collection: 'Superannuation', findClause: { superannuation: true, company: {$ne: null} }, salesforceVertical: 'Superannuation' },
  }
} else {
  specificVerticals = {
    'Car Loans': { collection: 'PersonalLoan', findClause: { isCarLoan: 'YES' }, salesforceVertical: 'Car Loans' },
    'Personal Loans': { collection: 'PersonalLoan', findClause: { isPersonalLoan: 'YES' }, salesforceVertical: 'Personal Loans' },
    'Home Loans': { collection: 'HomeLoanVariation', salesforceVertical: 'Home Loans' },
    'Pension': { collection: 'Superannuation', findClause: { pension: true, company: {$ne: null} }, salesforceVertical: 'Pension Funds' },
    'Savings Accounts': { collection: 'SavingsAccount', salesforceVertical: 'Savings A/C' },
    'Superannuation': { collection: 'Superannuation', findClause: { superannuation: true, company: {$ne: null} }, salesforceVertical: 'Superannuation' },
  }
}

module.exports = _.merge({}, specificVerticals, genericVerticals)
