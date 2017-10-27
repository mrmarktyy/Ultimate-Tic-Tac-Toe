// node --harmony_async_await uploads/creditCards.js
require('dotenv').config()

var keystone = require('keystone')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var csvToJson = require('../utils/csvToJson')
var utils = keystone.utils

const csvCCFilePath = './tmp/CreditCardData.csv'
const CreditCard = keystoneShell.list('CreditCard')
const Company = keystoneShell.list('Company')
const Program = keystoneShell.list('Program')
const Redemption = keystoneShell.list('Redemption')
const RedemptionName = keystoneShell.list('RedemptionName')
const RedemptionType = keystoneShell.list('RedemptionType')

const csvRedemptionFilePath = './tmp/Redemption.csv'

const CARDTYPES = {
  'mastercard': 'MasterCard',
  'amex': 'AMEX',
  'diners club': 'Diners Club',
  'visa & amex': 'Visa & AMEX',
  'mastercard & amex': 'MasterCard & AMEX',
  'visa': 'Visa',
}

const CARDLEVELS = {
  'standard': 'Standard',
  'gold': 'Gold',
  'platinium': 'Platinium',
  'premium': 'Premium',
}

async function populateCreditCards () {
  let connection = await mongoosePromise.connect()
  try {
    await CreditCard.model.remove({}).exec()

    let data = await csvToJson(csvCCFilePath)
    for (let i = 0; i < data.length; i++) {
      let item = data[i]
      let obj = {}
      obj.name = item.name

      if (item.uuid) {
        obj.uuid = item.uuid
      }

      let slug
      if (!item.slug) {
        slug = utils.slug(item.name.toLowerCase())
      } else {
        slug = item.slug
      }
      let company = {_id: null}
      if (item.company) {
        let cname = item.company
        company = await Company.model.findOne({$or: [{name: cname}, {displayName: cname}]}) //eslint-disable-line babel/no-await-in-loop
        // console.log(item.company, company)
      }
      let rewardProgram = {_id: null}
      if (item.rewardName || item.rewardProgram) {
        let rewardProgramName = item.rewardProgram
        rewardProgram = await Program.model.findOne({name: rewardProgramName}).exec() //eslint-disable-line babel/no-await-in-loop
      //   console.log('rewardProgram', item)
      //   console.log(item.name, item.rewardName, rewardProgram)
      }

      obj.otherNames = item.otherNames
      obj.displayName = item.displayName
      obj.isMonetized = false
      obj.isDiscontinued = false
      if (!item.promotedOrder) {
        obj.promotedOrder = 0
      } else {
        obj.promotedOrder = item.promotedOrder
      }

      obj.slug = slug
      obj.company = company._id
      obj.legacyCode = item.legacyCode
      obj.cardType = CARDTYPES[item.cardType.toLowerCase()]
      obj.cardLevel = CARDLEVELS[item.cardLevel.toLowerCase()]
      obj.isFrequentFlyer = item.isFrequentFlyer || false
      obj.ecpc = 0
      obj.interestFreeDays = item.interestFreeDays
      obj.minimumRepaymentDollars = item.minimumRepaymentDollars
      obj.minimumRepaymentPercent = item.minimumRepaymentPercent
      obj.minimumCreditLimit = item.minimumCreditLimit
      obj.maximumCreditLimit = item.maximumCreditLimit
      obj.numberFreeSupplementary = item.numberFreeSupplementary
      obj.applePayAvailable = item.applePayAvailable || 'UNKNOWN'
      obj.androidPayAvailable = item.androidPayAvailable  || 'UNKNOWN'
      obj.contactlessAvailable = item.contactlessAvailable  || 'UNKNOWN'
      obj.otherBenefits = item.otherBenefits
      obj.otherRestrictions = item.otherRestrictions
      obj.adminNotes = item.adminNotes
      obj.annualFeeIntro = item.annualFeeIntro
      obj.annualFeeIntroTerm = item.annualFeeIntroTerm
      obj.annualFeeStandard = item.annualFeeStandard || 0
      obj.annualFeeSpendWaiver = item.annualFeeSpendWaiver
      obj.annualFeeSpendWaiverTerm = item.annualFeeSpendWaiverTerm
      obj.annualFeeOtherWaiver = item.annualFeeOtherWaiver
      obj.balanceTransferFeeDollars = item.balanceTransferFeeDollars
      obj.balanceTransferFeePercent = item.balanceTransferFeePercent
      obj.cashAdvanceMinFee = item.cashAdvanceMinFee
      obj.cashAdvanceMaxFee = item.cashAdvanceMaxFee
      obj.cashAdvancePercent = item.cashAdvancePercent
      obj.foreignExchangeFeeVisaDollar = item.foreignExchangeFeeVisaDollar
      obj.foreignExchangeFeeVisaPercent = item.foreignExchangeFeeVisaPercent
      obj.foreignExchangeFeeVisaAtm = item.foreignExchangeFeeVisaAtm
      obj.visaOverseasReplaceCardFee = item.visaOverseasReplaceCardFee
      obj.foreignExchangeFeeMcDollar = item.foreignExchangeFeeMcDollar
      obj.foreignExchangeFeeMcPercent = item.foreignExchangeFeeMcPercent
      obj.foreignExchangeFeeMcATM = item.foreignExchangeFeeMcATM
      obj.mcOverseasReplaceCardFee = item.mcOverseasReplaceCardFee
      obj.foreignExchangeFeeAmexDollar = item.foreignExchangeFeeAmexDollar
      obj.foreignExchangeFeeAmexPercent = item.foreignExchangeFeeAmexPercent
      obj.foreignExchangeFeeAmexATM = item.foreignExchangeFeeAmexATM
      obj.amexOverseasReplaceCardFee = item.amexOverseasReplaceCardFee
      obj.foreignExchangeFeeAmexAudatInternational = item.foreignExchangeFeeAmexAudatInternational
      obj.latePaymentFee = item.latePaymentFee
      obj.overLimitFee = item.overLimitFee
      obj.duplicateStatementFee = item.duplicateStatementFee
      obj.supplementaryCardAnnualFee = item.supplementaryCardAnnualFee
      obj.minimumAge = item.minimumAge
      obj.minimumIncome = item.minimumIncome
      obj.minimumCreditRating = item.minimumCreditRating
      obj.availableTo457Visa = item.availableTo457Visa || 'UNKNOWN'
      obj.eligibilityConditions = item.eligibilityConditions
      obj.instantApproval = item.instantApproval || 'UNKNOWN'
      obj.perksFreeDomesticTravelInsurance = item.perksFreeDomesticTravelInsurance || 'UNKNOWN'
      obj.perksFreeDomesticTravelInsuranceConditions = item.perksFreeDomesticTravelInsuranceConditions
      obj.perksFreeInternationalTravelInsurance = item.perksFreeInternationalTravelInsurance || 'UNKNOWN'
      obj.perksFreeInternationalTravelInsuranceConditions = item.perksFreeInternationalTravelInsuranceConditions
      obj.perksFreeTravelInsuranceDays = item.perksFreeTravelInsuranceDays
      obj.perksFreeTravelInsuranceDaysConditions = item.perksFreeTravelInsuranceDaysConditions
      obj.perksFreeSupplementaryCards = item.perksFreeSupplementaryCards || 'UNKNOWN'
      obj.perksFreeSupplementaryCardsConditions = item.perksFreeSupplementaryCardsConditions
      obj.perksPurchaseProtection = item.perksPurchaseProtection || 'UNKNOWN'
      obj.perksPurchaseProtectionDays = item.perksPurchaseProtectionDays
      obj.perksPurchaseProtectionConditions = item.perksPurchaseProtectionConditions
      obj.perksPriceGuarantee = item.perksPriceGuarantee || 'UNKNOWN'
      obj.perksPriceGuaranteeConditions = item.perksPriceGuaranteeConditions
      obj.perksExtendedWarranty = item.perksExtendedWarranty || 'UNKNOWN'
      obj.perksExtendedWarrantyConditions = item.perksExtendedWarrantyConditions
      obj.perksRentalCarExcessInsurance = item.perksRentalCarExcessInsurance || "UNKNOWN"
      obj.perksRentalCarExcessInsuranceConditions = item.perksRentalCarExcessInsuranceConditions
      obj.perksVIPSeating = item.perksVIPSeating || 'UNKNOWN'
      obj.perksVIPSeatingConditions = item.perksVIPSeatingConditions
      obj.perksConcierge = item.perksConcierge || 'UNKNOWN'
      obj.perksConciergeConditions = item.perksConciergeConditions
      obj.perksSpecialEvents = item.perksSpecialEvents || 'UNKNOWN'
      obj.perksSpecialEventsConditions = item.perksSpecialEventsConditions
      obj.perksPartnerDiscounts = item.perksPartnerDiscounts.toUpperCase() || 'UNKNOWN'
      obj.perksPartnerDiscountsConditions = item.perksPartnerDiscountsConditions
      obj.perksAirportLounge = item.perksAirportLounge || 'UNKNOWN'
      obj.perksAirportLoungeConditions = item.perksAirportLoungeConditions
      obj.perksAdditional = item.perksAdditional
      obj.purchaseRateStandard = item.purchaseRateStandard || 0
      obj.purchaseRateIntro = item.purchaseRateIntro
      obj.purchaseRateIntroTerm = item.purchaseRateIntroTerm
      obj.balanceTransferStandard = item.balanceTransferStandard
      obj.balanceTransferIntro = item.balanceTransferIntro
      obj.balanceTransferIntroTerm = item.balanceTransferIntroTerm
      obj.cashAdvanceRateStandard = item.cashAdvanceRateStandard
      obj.cashAdvanceRateIntro = item.cashAdvanceRateIntro
      obj.cashAdvanceRateIntroTerm = item.cashAdvanceRateIntroTerm
      obj.rewardProgram = rewardProgram._id
      obj.pointsCap = item.pointsCap
      obj.pointsCapFrequency = item.pointsCapFrequency
      obj.earnRateVisaMcTier1 = item.earnRateVisaMcTier1
      obj.earnRateVisMcTier1Limit = item.earnRateVisMcTier1Limit
      obj.earnRateVisMcTier1LimitFrequency = item.earnRateVisMcTier1LimitFrequency
      obj.earnRateVisMcTier2 = item.earnRateVisMcTier2
      obj.earnRateVisaMcTier2Limit = item.earnRateVisaMcTier2Limit
      obj.earnRateAmexTier1 = item.earnRateAmexTier1
      obj.earnRateAmexTier1Limit = item.earnRateAmexTier1Limit
      obj.earnRateAmexTier1LimitFrequency = item.earnRateAmexTier1LimitFrequency
      obj.earnRateAmexTier2 = item.earnRateAmexTier2
      obj.earnRateAmexTier2Limit = item.earnRateAmexTier2Limit
      obj.bonusPoints = item.bonusPoints
      obj.bonusPointsConditions = item.bonusPointsConditions

      await CreditCard.model.create(obj, (error) => {
        if (error) {
          console.log(obj)
          console.log(error)
          return error
        }
      }) // eslint-disable-line babel/no-await-in-loop
    }

    connection.close()
  } catch (error) {
    console.log(error)
    return error
  }
}

async function populateRedemptions () {
  let connection = await mongoosePromise.connect()
  try {
    const programs = await Program.model.find({isReward: true}).exec()
    const redemptionTypes = await RedemptionType.model.find().exec()
    const redemptionNames = await RedemptionName.model.find().exec()

    await Redemption.model.remove({}).exec()

    let data = await csvToJson(csvRedemptionFilePath)
    for (let i = 0; i < data.length; i++) {
      let item = data[i]
      let obj = {}
      let program = programs.filter((prog) => {
        return prog.name === item.rewardProgram
      })[0]

      let redemptionType =  redemptionTypes.filter((redemp) => {
        return redemp.name === item.redemptionType
      })[0]
      let redemptionName = redemptionNames.filter((redemp) => {
        return redemp.name === item.redemptionName
      })[0]

      if (!(redemptionType || redemptionName)) {
        throw 'redemptionError'
      }
      obj.program = program._id
      obj.redemptionType = redemptionType._id
      obj.redemptionName = redemptionName._id
      obj.pointsRequired = item.pointsRequired

      await Redemption.model.create(obj, (error) => {
        if (error) {
          console.log(obj)
          console.log(error)
          return error
        }
      }) // eslint-disable-line babel/no-await-in-loop

    }

    connection.close()
  } catch (error) {
      console.log(error)
  }
}

module.exports = async function () {
  await populateCreditCards()
  await populateRedemptions()
}()
