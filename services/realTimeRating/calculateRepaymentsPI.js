// import { toTwoDecimal, PMT } from '../comparisonRateCalculatorUtils'
const calculatorUtils = require('../ComparisonRateCalculator')
const toTwoDecimal = calculatorUtils.toTwoDecimal
const PMT = calculatorUtils.PMT

module.exports = function (data) {
  const {
    monthlyRate,
    loanAmount,
    loanTermInMonth,
    introTermInMonth,
    monthlyIntroRate,
    totalUpfrontFees,
    totalMonthlyFees,
    totalYearlyFees,
    fixedLoan,
    introLoan,
    fixedRate,
    fixedTermInMonth,
    cashBenefit,
  } = data

  const repayments = []
  const pmtRepayment = PMT(monthlyRate, loanTermInMonth, -loanAmount)
  let remainingPrincipal = loanAmount
  let remainingLoanTerm = loanTermInMonth

  if (fixedLoan || introLoan) {
    let specialMonthlyRate = fixedRate || monthlyIntroRate
    let specialTerm = fixedTermInMonth || introTermInMonth

    remainingLoanTerm = remainingLoanTerm - specialTerm

    let remainingPrincipal = loanAmount
    const pmtRepayment1 = PMT(specialMonthlyRate, loanTermInMonth, -remainingPrincipal)

    for (let i = specialTerm; i > 0; i--) {
      const interestComponent = remainingPrincipal * specialMonthlyRate
      repayments.push(toTwoDecimal(interestComponent))
      remainingPrincipal = remainingPrincipal - (pmtRepayment1 - interestComponent)
    }

    const pmtRepayment2 = PMT(monthlyRate, remainingLoanTerm, -remainingPrincipal)

    for (let i = remainingLoanTerm; i > 0; i--) {
      const interestComponent = remainingPrincipal * monthlyRate
      repayments.push(toTwoDecimal(interestComponent))
      remainingPrincipal = remainingPrincipal - (pmtRepayment2 - interestComponent)
    }
  } else {
    for (let i = remainingLoanTerm; i > 0; i--) {
      const interestComponent = remainingPrincipal * monthlyRate
      repayments.push(toTwoDecimal(interestComponent))
      remainingPrincipal = remainingPrincipal - (pmtRepayment - interestComponent)
    }
  }

  const size = repayments.length - 1

  let remainingBenefit = cashBenefit
  for (let i = 0; i <= size; i++) {
    if (i === 0) {
      repayments[i] = repayments[i] + totalUpfrontFees
    }
    repayments[i] = repayments[i] + totalMonthlyFees
    if (remainingBenefit > 0) {
      let remainder = -repayments[i] + remainingBenefit
      repayments[i] = remainder > 0 ? 0 : repayments[i] - remainingBenefit
      remainingBenefit = remainder
    }
    if (i % 12 === 0) {
      repayments[i] = repayments[i] + totalYearlyFees// add yearly fee
    }
  }

  return repayments
}
