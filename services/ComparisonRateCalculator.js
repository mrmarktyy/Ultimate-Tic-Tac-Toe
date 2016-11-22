function calculateComparisonRate(rate, loanAmount, loanTerm, introRate, introTerm, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees) {
	let cashflow = []
	cashflow.push(Number(Math.round(parseFloat(-loanAmount) + 'e2') + 'e-2'))

	let remainingLoanTerm = loanTerm
	let remainingPrincipal = loanAmount
	if (introRate && introTerm) {
		let repayment = PMT(introRate, remainingLoanTerm, -remainingPrincipal);
		let i = introTerm
		while (i > 0) {
			cashflow.push(Number(Math.round(parseFloat(repayment) + 'e2') + 'e-2'))
			remainingPrincipal = remainingPrincipal - (repayment - remainingPrincipal * introRate);
			i--;
		}
		remainingLoanTerm = loanTerm - introTerm
	}
	let repayment = PMT(rate, remainingLoanTerm, -remainingPrincipal);
	for (let i = remainingLoanTerm; i > 0; i--) {
		cashflow.push(Number(Math.round(parseFloat(repayment) + 'e2') + 'e-2'))
	}

	let size = cashflow.length - 1; // last month payment is only interest + end of loan fee
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
	console.log(cashflow)

	var comparisonRate = IRR(cashflow);
	console.log(comparisonRate * 12)
	return Number(Math.round(parseFloat(comparisonRate * 12) + 'e2') + 'e-2')
}

exports.calculatePersonalLoanComparisonRate = function (rate, introRate, introTerm, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees) {
	let monthlyRate = rate / 100 / 12
	let monthlyIntroRate = introRate / 100 / 12
	let loanAmount = 10000
	let loanTerm = 36

	console.log("calculating......",rate, introRate, introTerm, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees)
	return calculateComparisonRate(monthlyRate, loanAmount, loanTerm, monthlyIntroRate, introTerm, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees)
}

function calculateCarlLoanComparisonRate(rate, introRate, introTerm, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees) {
	let monthlyRate = rate / 100 / 12
	let monthlyIntroRate = introRate / 100 / 12
	let loanAmount = 30000
	let loanTerm = 60

	return calculateComparisonRate(monthlyRate, loanAmount, loanTerm, monthlyIntroRate, introTerm, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees)
}

function PMT(rate, nper, pv, fv, type) {
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

function IRR(CArray) {
	min = 0.0;
	max = 1.0;
	do {
		guest = (min + max) / 2;
		NPV = 0;
		for (var j = 0; j < CArray.length; j++) {
			NPV += CArray[j] / Math.pow((1 + guest), j);
		}
		if (NPV > 0) {
			min = guest;
		}
		else {
			max = guest;
		}
	} while (Math.abs(NPV) > 0.000001);
	return guest * 100;
}


// calculatePersonalLoanComparisonRate(4.5, 3.5, 12, 50, 40, 200, 0)
