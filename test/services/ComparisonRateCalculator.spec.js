var assert = require('assert');
var ComparisonRateCalculator = require('../../services/ComparisonRateCalculator')

describe('Test Personal Loan Comparison Rate Calculator', function() {

	describe('test 1 without intro term', function() {
		it('should return the exact CR', function() {
			let cr = ComparisonRateCalculator.calculatePersonalLoanComparisonRate(4.5, 0, 0, 52, 0, 100, 20)
			assert.equal(cr, 6.88);
		});
	});

	describe('test 2 with intro term', function() {
		it('should return the exact CR', function() {
			let cr = ComparisonRateCalculator.calculatePersonalLoanComparisonRate(4.5, 2.0, 12, 52, 0, 100, 20)
			assert.equal(cr, 5.49);
		});
	});
});

describe('Test Car Loan Comparison Rate Calculator', function() {

	describe('test 1 without intro term', function() {
		it('should return the exact CR', function() {
			let cr = ComparisonRateCalculator.calculateCarlLoanComparisonRate(6.49, 0, 0, 250, 0, 0, 0)
			assert.equal(cr, 6.84);
		});
	});

	describe('test 2 with intro term', function() {
		it('should return the exact CR', function() {
			let cr = ComparisonRateCalculator.calculateCarlLoanComparisonRate(6.49, 5.8, 24, 250, 0, 0, 0)
			assert.equal(cr, 6.39);
		});
	});
});
