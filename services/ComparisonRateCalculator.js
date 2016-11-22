function calculateComparisonRate(rate, loanAmount, loanTerm, introRate, introTerm, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees) {
	let cashflow = []
	cashflow.push(-loanAmount)
	let repayment = PMT(rate, loanTerm, -loanAmount);
	for (let i = loanTerm; i > 0; i--) {
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
	return Number(Math.round(parseFloat(comparisonRate) + 'e2') + 'e-2')
}

function calculatePersonalLoanComparisonRate(rate, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees) {
	let monthlyRate = rate / 100 / 12
	let loanAmount = 10000
	let loanTerm = 36

	calculateComparisonRate(monthlyRate, loanAmount, loanTerm, 0, 0, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees)
}

function calculateCarlLoanComparisonRate(rate, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees) {
	let monthlyRate = rate / 100 / 12
	let loanAmount = 30000
	let loanTerm = 60

	calculateComparisonRate(monthlyRate, loanAmount, loanTerm, 0, 0, totalUpfrontFees, totalMonthlyFees, totalYearlyFees, totalEndOfLoanFees)
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
		for (var j=0; j<CArray.length; j++) {
			NPV += CArray[j]/Math.pow((1+guest),j);
		}
		if (NPV > 0) {
			min = guest;
		}
		else {
			max = guest;
		}
	} while(Math.abs(NPV) > 0.000001);
	return guest * 100;
}


// calculatePersonalLoanComparisonRate(4.5, 50, 10, 100, 200)
