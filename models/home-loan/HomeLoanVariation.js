var keystone = require('keystone')
var uuid = require('node-uuid')
var Types = keystone.Field.Types
var Fee = keystone.list('Fee')
var productCommonAttributes = require('../common/ProductCommonAttributes')
var ComparisonRateCalculator = require('../../services/ComparisonRateCalculator')
var changeLogService = require('../../services/changeLogService')
var utils = keystone.utils

var HomeLoanVariation = new keystone.List('HomeLoanVariation', {
  track: true,
})

HomeLoanVariation.add(productCommonAttributes)

HomeLoanVariation.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
		noedit: true,
	},
	product: {
		type: Types.Relationship,
		ref: 'HomeLoan',
		required: true,
		initial: true,
		index: true,
		noedit: true,
		filters: {company: ':company'},
	},
	name: {type: Types.Text, required: true, initial: true, index: true},
	neo4jId: {type: Types.Number, noedit: true},
	legacyCode: {type: Types.Text, noedit: true},
	ecpc: {type: Types.Number, noedit: true},
	monthlyClicks: {type: Types.Number, noedit: true, min: 0, default: 0},
	fixMonth: {type: Types.Number, initial: true},
	minTotalLoanAmount: {type: Types.Number, initial: true},
	maxTotalLoanAmount: {type: Types.Number, initial: true},
	minLVR: {type: Types.Number, initial: true},
	maxLVR: {type: Types.Number, initial: true},
	rate: {type: Types.Number, initial: true, required: true},
	comparisonRate: {type: Types.Number, initial: true},
	calculatedComparisonRate: {type: Types.Number, initial: true, noedit: true},
	revertRate: {type: Types.Number, initial: true},
	introductoryRate: {type: Types.Number, initial: true},
	introductoryTerm: {type: Types.Number, initial: true},
	revertVariation: {
		type: Types.Relationship,
		ref: 'HomeLoanVariation',
		initial: true,
    noedit: false,
		filters: {company: ':company'},
	},
  removeRevertVariation: {type: Types.Boolean, indent: true, initial: false}
})

HomeLoanVariation.schema.pre('validate', function (next) {
  if ((this.minTotalLoanAmount > this.maxTotalLoanAmount) && this.maxTotalLoanAmount != null) {
    next(Error('Max Total LoanAmount can not less than Min Total Loan Amount'))
  }
  if (this.minLVR < 0 || this.minLVR > 100) {
    next(Error('Min LVR need to between 0 and 100 inclusive'))
  }
  if (this.maxLVR < 0 || this.maxLVR > 100) {
    next(Error('Max LVR need to between 0 and 100 inclusive'))
  }
  if ((this.minLVR > this.maxLVR) && this.maxLVR != null) {
    next(Error('Max LVR can not less than Min LVR'))
  }
  if (this.introductoryRate > this.rate) {
    next(Error('Introductory Rate need to less or equal than Rate'))
  }
  if (this.fixMonth && !this.revertRate && (!this.revertVariation || (this.revertVariation && this.removeRevertVariation))) {
    next(Error('This is a Variation for Fix HomeLoan. Need either a revertRate or revertVariation'))
  }
  if (this.fixMonth && this.revertRate && this.revertVariation && !this.removeRevertVariation) {
    next(Error('Only one revert info needed. Either a revertRate or a revertVariation'))
  }
  if (this.isMonetized && this.isDiscontinued) {
     next(Error('You cannot discontinue a variation that is monetized.'))
  }
  next()
})

HomeLoanVariation.schema.pre('save', async function (next) {
  if (this.removeRevertVariation) {
    this.revertVariation = null
  }
  this.removeRevertVariation = undefined
  if (!this.uuid) {
    this.uuid = uuid.v4()
  }

  if (!this.slug) {
    let slug = utils.slug(this.name.toLowerCase())
    this.slug = slug
  }
  await changeLogService(this)

  let thiz = this
  let promise = Fee.model.find({product: this.product}).exec()
  promise.then((fees) => {
    let loan = {}
    loan.totalYearlyFees = 0
    loan.totalMonthlyFees = 0
    loan.totalUpfrontFees = 0
    loan.totalEndOfLoanFees = 0
    fees.forEach((fee) => {
      if (fee.feeType === 'SETTLEMENT_FEE' || fee.feeType === 'VALUATION_FEE' || fee.feeType === 'LEGAL_FEE' ||
          fee.feeType === 'APPLICATION_FEE' || fee.feeType === 'MANDATORY_RATE_LOCK_FEE') {
        loan.totalUpfrontFees += fee.fixedCost
      }
      if (fee.feeType === 'DISCHARGE_FEE') {
        loan.totalEndOfLoanFees += fee.fixedCost
      }
      if (fee.feeType === 'ONGOING_FEE' && fee.frequency ==='ANNUALLY') {
        loan.totalYearlyFees += fee.fixedCost
      }
      if (fee.feeType === 'ONGOING_FEE' && fee.frequency ==='MONTHLY') {
        loan.totalMonthlyFees  += fee.fixedCost
      }
    })

    let revertVariationPromise
    if (thiz.fixMonth) { // Fix product
      loan.yearlyIntroRate = thiz.rate
      loan.introTermInMonth = thiz.fixMonth
      if (thiz.revertRate) {
        loan.yearlyRate = thiz.revertRate
      } else {
        revertVariationPromise = HomeLoanVariation.model.findOne({'_id': thiz.revertVariation}).exec()
      }
    } else { // Variable product
      loan.yearlyRate = thiz.rate
      loan.yearlyIntroRate = thiz.introductoryRate
      loan.introTermInMonth = thiz.introductoryTerm
    }

    if (revertVariationPromise) {
      revertVariationPromise.then((variation) => {
        loan.yearlyRate = variation.rate
        thiz.calculatedComparisonRate = ComparisonRateCalculator.calculateHomeLoanComparisonRate(loan)
        next()
      })
    } else {
      thiz.calculatedComparisonRate = ComparisonRateCalculator.calculateHomeLoanComparisonRate(loan)
      next()
    }
  })
})

HomeLoanVariation.schema.methods.remove = function (callback) {
  this.isDiscontinued = true
  return this.save(callback)
}

HomeLoanVariation.defaultSort = 'isDiscontinued'
HomeLoanVariation.defaultColumns = 'name|40%, company, rate, revertRate, introductoryRate isDiscontinued'
HomeLoanVariation.register()
