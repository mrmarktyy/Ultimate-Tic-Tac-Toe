exports.getPersonalLoanUpfrontFee = function (personalLoan) {
	if (personalLoan.applicationFeesDollar != null) {
		return personalLoan.applicationFeesDollar
	}
	if (personalLoan.applicationFeesPercent != null) {
		return personalLoan.applicationFeesPercent * 10000
	}
}

exports.getCarLoanUpfrontFee = function (personalLoan) {
	if (personalLoan.applicationFeesDollar != null) {
		return personalLoan.applicationFeesDollar
	}
	if (personalLoan.applicationFeesPercent != null) {
		return personalLoan.applicationFeesPercent * 30000
	}
}

exports.getTotalMonthlyFee = function (loan) {
	if (loan.ongoingFeesFrequency === 'Monthly') {
		return loan.ongoingFees
	} else {
		return 0
	}
}

exports.getTotalYearlyFee = function (loan) {
	if (loan.ongoingFeesFrequency === 'Annually') {
		return loan.ongoingFees
	} else {
		return 0
	}
}
