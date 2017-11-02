const genericVerticals = require('./genericVerticals')

var verticals = [
  { value: 'home-loans', label: 'Home Loans' },
  { value: 'credit-cards', label: 'Credit Cards' },
  { value: 'savings-accounts', label: 'Savings Accounts' },
  { value: 'transaction-accounts', label: 'Transaction Accounts' },
  { value: 'personal-loans', label: 'Personal Loans' },
  { value: 'car-loans', label: 'Car Loans' },
  { value: 'superannuation', label: 'Superannuation' },
  { value: 'pension-funds', label: 'Pension' },
  { value: 'managed-funds', label: 'Managed Funds' },
]

Object.entries(genericVerticals).forEach(([key, value]) => {
  verticals.push({ value: value['findClause']['vertical'], label: key })
})

module.exports = verticals
