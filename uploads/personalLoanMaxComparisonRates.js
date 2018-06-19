// node uploads/personalLoanMaxComparisonRates.js
require('dotenv').config()

var ComparisonRateCalculator = require('../services/ComparisonRateCalculator')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var mongoose = require('mongoose')
var logger = require('../utils/logger')

const PersonalLoanVariation = keystoneShell.list('PersonalLoanVariation')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    let variations = await PersonalLoanVariation.model.find().populate('product').exec()
    variations = variations.filter(function (variation) {
      return variation.product.isPersonalLoan === 'YES'
    })
    for (let i = 0; i < variations.length; i++) {
      let variation = variations[i]
      let loan = {
        yearlyRate: variation.generateRange ? variation.minRate - (variation.minRate * variation.generateRange/100) : variation.minRate,
        yearlyIntroRate: variation.introRate,
        introTermInMonth: variation.introTerm,
        totalMonthlyFees: variation.product.totalMonthlyFee,
        totalYearlyFees: variation.product.totalYearlyFee,
        totalUpfrontFees: variation.product.personalLoanTotalUpfrontFee30000,
        loanAmount: 30000,
        loanTermInMonth: 60,
        riskAssuranceFee: variation.riskAssuranceFee ? variation.riskAssuranceFee : 0,
      }
      let comp5Years = ComparisonRateCalculator.calculatePersonalLoanComparisonRate(loan)
      let maxLoan = Object.assign(
        {},
        loan,
        {
          yearlyRate: variation.generateRange ? variation.maxRate + (variation.maxRate * variation.generateRange/100) : variation.maxRate,
        }
      )
      let maxComparisonRate = ComparisonRateCalculator.calculatePersonalLoanComparisonRate(maxLoan)
      await PersonalLoanVariation.model.update({_id: mongoose.Types.ObjectId(variation._id)}, {$set: {comparisonRatePersonal5Years: comp5Years, maxComparisonRate: maxComparisonRate}}, {}).exec() // eslint-disable-line babel/no-await-in-loop
      console.log(loan)
      console.log(variation)
    }
    connection.close()
  } catch (error) {
    logger.error(error)
    return error
  }
}()
