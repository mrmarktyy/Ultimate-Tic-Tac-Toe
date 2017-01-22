var assert = require('assert')
var ComparisonRateCalculator = require('../../services/ComparisonRateCalculator')

describe('Personal Loan Comparison Rate Calculator', () => {

	describe('Without intro term', () => {
		it('Should return the exact Comparison Rate', () => {
			let cr = ComparisonRateCalculator.calculatePersonalLoanComparisonRate(4.5, 0, 0, 52, 0, 100, 20)
			assert.equal(cr, 6.88)
		})
	})

	describe('With intro term', () => {
		it('Should return the exact Comparison Rate', () => {
			let cr = ComparisonRateCalculator.calculatePersonalLoanComparisonRate(4.5, 2.0, 12, 52, 0, 100, 20)
			assert.equal(cr, 5.49)
		})
	})
})

describe('Car Loan Comparison Rate Calculator', () => {

	describe('Without intro term', () => {
		it('Should return the exact Comparison Rate', () => {
			let cr = ComparisonRateCalculator.calculateCarlLoanComparisonRate(6.49, 0, 0, 250, 0, 0, 0)
			assert.equal(cr, 6.84)
		})
	})

	describe('With intro term', () => {
		it('Should return the exact Comparison Rate', () => {
			let cr = ComparisonRateCalculator.calculateCarlLoanComparisonRate(6.49, 5.8, 24, 250, 0, 0, 0)
			assert.equal(cr, 6.39)
		})
	})
})
