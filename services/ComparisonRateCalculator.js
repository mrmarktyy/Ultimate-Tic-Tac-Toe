var personalLoanConstant = require('../models/constants/PersonalLoanConstant')

function calculateComparisonRate (monthlyRate, loanAmount, loanTermInMonth, monthlyIntroRate, introTermInMonth, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees) {
	let cashflow = []
	cashflow.push(toTwoDecimal(-loanAmount))

	let remainingLoanTerm = loanTermInMonth
	let remainingPrincipal = loanAmount
	if (monthlyIntroRate && introTermInMonth) {
		let repayment = PMT(monthlyIntroRate, remainingLoanTerm, -remainingPrincipal)
		let i = introTermInMonth
		while (i > 0) {
			cashflow.push(toTwoDecimal(repayment))
			remainingPrincipal = remainingPrincipal - (repayment - remainingPrincipal * monthlyIntroRate)
			i--
		}
		remainingLoanTerm = loanTermInMonth - introTermInMonth
	}
	let repayment = PMT(monthlyRate, remainingLoanTerm, -remainingPrincipal)
	for (let i = remainingLoanTerm; i > 0; i--) {
		cashflow.push(toTwoDecimal(repayment))
	}

	let size = cashflow.length - 1 // last month payment is only interest + end of loan fee
	for (let i = 0; i < size; i++) {
		if (i == 0) {
			cashflow[i] = cashflow[i] + totalUpfrontFees
		}
		cashflow[i] = cashflow[i] + totalMonthlyFees // add monthly fee
		if (i % 12 == 0) {
			cashflow[i] = cashflow[i] + totalYearlyFees// add yearly fee
		}
	}
	cashflow[size] = cashflow[size] + totalEndOfLoanFees //  add end of loan fees

	var comparisonRate = IRR(cashflow)
	return toTwoDecimal(comparisonRate * 12)
}

function toTwoDecimal (number) {
	return Number(Math.round(parseFloat(number) + 'e2') + 'e-2')
}

exports.calculatePersonalLoanComparisonRate = function (data = {}) {
	let {
		yearlyRate = 0,
		yearlyIntroRate = 0,
		introTermInMonth = 0,
		totalUpfrontFees = 0,
		totalMonthlyFees = 0,
		totalYearlyFees = 0,
		totalEndOfLoanFees = 0,
	} = data

	let monthlyRate = yearlyRate / 100 / 12
	let monthlyIntroRate = yearlyIntroRate / 100 / 12
	let loanAmount = personalLoanConstant.PERSONAL_LOAN_DEFAULT_LOAN_AMOUNT
	let loanTermInMonth = personalLoanConstant.PERSONAL_LOAN_DEFAULT_LOAN_TERM

	return calculateComparisonRate(monthlyRate, loanAmount, loanTermInMonth, monthlyIntroRate, introTermInMonth, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees)
}

exports.calculateCarlLoanComparisonRate = function (data) {
	let {
		yearlyRate = 0,
		yearlyIntroRate = 0,
		introTermInMonth = 0,
		totalUpfrontFees = 0,
		totalMonthlyFees = 0,
		totalYearlyFees = 0,
		totalEndOfLoanFees = 0,
	} = data

	let monthlyRate = yearlyRate / 100 / 12
	let monthlyIntroRate = yearlyIntroRate / 100 / 12
	let loanAmount = personalLoanConstant.CAR_LOAN_DEFAULT_LOAN_AMOUNT
	let loanTermInMonth = personalLoanConstant.CAR_LOAN_DEFAULT_LOAN_TERM

	return calculateComparisonRate(monthlyRate, loanAmount, loanTermInMonth, monthlyIntroRate, introTermInMonth, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees)
}

function PMT (rate, nper, pv, fv, type) {
	if (!fv) fv = 0
	if (!type) type = 0

	if (rate == 0) return -(pv + fv) / nper

	var pvif = Math.pow(1 + rate, nper)
	var pmt = rate / (pvif - 1) * -(pv * pvif + fv)

	if (type == 1) {
		pmt /= (1 + rate)
	}

	return pmt
}

function IRR (CArray) {
	min = 0.0
	max = 1.0
	do {
		guest = (min + max) / 2
		NPV = 0
		for (var j = 0; j < CArray.length; j++) {
			NPV += CArray[j] / Math.pow((1 + guest), j)
		}
		if (NPV > 0) {
			min = guest
		}
		else {
			max = guest
		}
	} while (Math.abs(NPV) > 0.000001)
	return guest * 100
}
