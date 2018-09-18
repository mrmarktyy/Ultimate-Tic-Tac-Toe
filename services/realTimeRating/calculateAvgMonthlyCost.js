const calculateRepaymentsIO = require('./calculateRepaymentsIO')
const calculateRepaymentsPI = require('./calculateRepaymentsPI')
const calculatorUtils = require('../ComparisonRateCalculator')

module.exports = function (data, userLoanTermInMonth, type) {
  let repayments
  if (type === 'IO') {
    repayments = calculateRepaymentsIO(data)
  } else {
    repayments = calculateRepaymentsPI(data)
  }

  let repaymentsOverUserLoanTerm = repayments.slice(0, userLoanTermInMonth)
  repaymentsOverUserLoanTerm[userLoanTermInMonth - 1] += data.totalEndOfLoanFees // add the end of loan fees here

  const totalCostDuringUserLoanTerm = repaymentsOverUserLoanTerm.reduce((a, b) => a + b, 0)
  const averageMonthlyCost = totalCostDuringUserLoanTerm / userLoanTermInMonth

  return calculatorUtils.round(averageMonthlyCost, 2)
}
