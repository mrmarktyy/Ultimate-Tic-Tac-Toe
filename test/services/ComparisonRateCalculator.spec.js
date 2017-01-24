var assert = require('assert')
var ComparisonRateCalculator = require('../../services/ComparisonRateCalculator')

describe('Personal Loan Comparison Rate Calculator', () => {

	describe('Without intro term', () => {
		it('Should return the exact Comparison Rate', () => {
			let data = {
				yearlyRate: 4.5,
				yearlyIntroRate: 0,
				introTermInMonth: 0,
				totalUpfrontFees: 52,
				totalMonthlyFees: 0,
				totalYearlyFees: 100,
				totalEndOfLoanFees: 20,
			}
			let cr = ComparisonRateCalculator.calculatePersonalLoanComparisonRate(data)
			assert.equal(cr, 6.88)
		})
	})

	describe('With intro term', () => {
		it('Should return the exact Comparison Rate', () => {
			let data = {
				yearlyRate: 4.5,
				yearlyIntroRate: 2.0,
				introTermInMonth: 12,
				totalUpfrontFees: 52,
				totalMonthlyFees: 0,
				totalYearlyFees: 100,
				totalEndOfLoanFees: 20,
			}
			let cr = ComparisonRateCalculator.calculatePersonalLoanComparisonRate(data)
			assert.equal(cr, 5.49)
		})
	})
})

describe('Car Loan Comparison Rate Calculator', () => {

	describe('Without intro term', () => {
		it('Should return the exact Comparison Rate', () => {
			let data = {
				yearlyRate: 6.49,
				yearlyIntroRate: 0,
				introTermInMonth: 0,
				totalUpfrontFees: 250,
				totalMonthlyFees: 0,
				totalYearlyFees: 0,
				totalEndOfLoanFees: 0,
			}
			let cr = ComparisonRateCalculator.calculateCarlLoanComparisonRate(data)
			assert.equal(cr, 6.84)
		})
	})

	describe('With intro term', () => {
		it('Should return the exact Comparison Rate', () => {
			let data = {
				yearlyRate: 6.49,
				yearlyIntroRate: 5.8,
				introTermInMonth: 24,
				totalUpfrontFees: 250,
				totalMonthlyFees: 0,
				totalYearlyFees: 0,
				totalEndOfLoanFees: 0,
			}
			let cr = ComparisonRateCalculator.calculateCarlLoanComparisonRate(data)
			assert.equal(cr, 6.39)
		})
	})
})
