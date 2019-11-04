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
  let interestComponent = loanAmount * monthlyRate
  let remainingLoanTerm = 60

  if (fixedLoan) {
    remainingLoanTerm = remainingLoanTerm - fixedTermInMonth
    const loanTermPMT = loanTermInMonth - fixedTermInMonth
    let remainingPrincipal = loanAmount
    interestComponent = loanAmount * fixedRate

    let i = fixedTermInMonth
    while(i > 0) {
      repayments.push(toTwoDecimal(interestComponent))
      i--
    }

    const pmtRepayment = PMT(monthlyRate, loanTermPMT, -remainingPrincipal)

    for (let i = remainingLoanTerm; i > 0; i--) {
      interestComponent = remainingPrincipal * monthlyRate
      repayments.push(toTwoDecimal(interestComponent))
      remainingPrincipal = remainingPrincipal - (pmtRepayment - interestComponent)
    }
  }

  if (introLoan) {
    interestComponent = loanAmount * monthlyIntroRate
    remainingLoanTerm = remainingLoanTerm - introTermInMonth

    let i = introTermInMonth
    while(i > 0) {
      repayments.push(toTwoDecimal(interestComponent))
      i--
    }

    for (let i = remainingLoanTerm; i > 0; i--) {
      interestComponent = loanAmount * monthlyRate
      repayments.push(toTwoDecimal(interestComponent))
    }
  }

  for (let i = remainingLoanTerm; i > 0; i--) {
    repayments.push(toTwoDecimal(interestComponent))
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
