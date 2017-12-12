var keystone = require('keystone')
var CompanyService = require('../../services/CompanyService')

const CreditCard = keystone.list('CreditCard')
const Redemption = keystone.list('Redemption')
const EarnRate = keystone.list('EarnRate')
const PartnerConversion = keystone.list('PartnerConversion')
const monetizedCollection = require('./monetizedCollection')

exports.list = async function (req, res) {
  let removeFields = { updatedAt: 0, updatedBy: 0, isMonetized: 0, __v: 0, createdAt: 0, createdBy: 0 }
  let removePopulatedFields = '-updatedAt -updatedBy -__v  -createdAt -createdBy'
  let monetizedList = await monetizedCollection('Credit Cards')
  let partnerConversions = await PartnerConversion.model.find()
    .populate('rewardProgram partnerProgram', removePopulatedFields)
    .lean()
    .exec()
  let redemptions = await Redemption.model.find()
    .populate('redemptionName redemptionType program', removePopulatedFields)
    .lean()
    .exec()
  let creditcards = await CreditCard.model
    .find({ $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] }, removeFields)
    .populate('company rewardProgram', removePopulatedFields)
    .lean()
    .exec()

  let earnRate = await EarnRate.model.find({}, removeFields)
    .lean()
    .exec()

  creditcards.forEach((card) => {
    let company = CompanyService.fixLogoUrl(card.company)
    if (company.logo && company.logo.url) {
      company.logo = company.logo.url
    }
    card.company  = company

    let monetize = monetizedList[card._id]
    card.gotoSiteUrl = monetize ? monetize.applyUrl : null
    card.gotoSiteEnabled = monetize ? monetize.enabled : false
    card.paymentType = monetize ? monetize.paymentType : null
    card.cardArt = card.cardArt ? card.cardArt.url : null

    card.foreignExchangeFeeMCDollar = card.foreignExchangeFeeMcDollar
    card.foreignExchangeFeeMCPercent= card.foreignExchangeFeeMcPercent
    card.foreignExchangeFeeMCATM = card.foreignExchangeFeeMcATM
    delete card.foreignExchangeFeeMcDollar
    delete card.foreignExchangeFeeMcPercent
    delete card.foreignExchangeFeeMcATM
    card.balanceTransferConditions = card.balanceTransferConditions === '' ? null : card.balanceTransferConditions

    card.estimatedForeignAtmCost = estimatedForeignAtmCost(card)
    if (card.rewardProgram) {
      card.rewardProgram.redemptions = redemptionCalculation(redemptions, card.rewardProgram._id.toString())
      card.isFrequentFlyer = card.rewardProgram.isFrequentFlyer || false
      let partners = []
      partnerConversions.forEach((obj) => {
        if (card.rewardProgram._id.toString() === obj.rewardProgram._id.toString()) {
          let partnerObject = {
            partnerProgram: obj.partnerProgram.name,
            conversionRate: obj.conversionRate,
            redemptions: redemptionCalculation(redemptions, obj.partnerProgram._id.toString(), obj.conversionRate),
            icon: obj.partnerProgram.icon = obj.partnerProgram.icon ? obj.partnerProgram.icon.url : null,
          }
          partners.push(partnerObject)
          if (obj.partnerProgram.isFrequentFlyer && !card.isFrequentFlyer) {
            card.isFrequentFlyer = obj.partnerProgram.isFrequentFlyer
          }
        }
      })

      card.partners = partners

      card.earnRate = earnRate.filter((obj) => {
        return obj.product.toString() === card._id.toString()
      })
    } else {
      card.partners = []
      card.earnRate = null
      card.isFrequentFlyer = false
    }
  })
  res.jsonp(creditcards)
}

function estimatedForeignAtmCost (card) {
  let estimate = 0
  if (['Visa', 'Visa & AMEX'].includes(card.cardType)){
    estimate = (300.0 * card.foreignExchangeFeeVisaPercent)/100 + card.foreignExchangeFeeVisaAtm
  }
  if (['MasterCard', 'MasterCard & AMEX'].includes(card.cardType)) {
    estimate = (300.0 * card.foreignExchangeFeeMcPercent)/100 + card.foreignExchangeFeeMcAtm
  }
  if (['Visa & AMEX', 'MasterCard & AMEX'].includes(this.cardType)) {
    let amex = (300.0 * card.foreignExchangeFeeAmexPercent)/100 + card.foreignExchangeFeeAmexAtm
    estimate = estimate > amex ? estimate : amex
  }
  if (card.cardType === 'AMEX') {
    estimate = (300.0 * card.foreignExchangeFeeAmexPercent)/100 + card.foreignExchangeFeeAmexAtm
  }
  return estimate
}

function redemptionCalculation (redemptions, rewardProgramId, pointconversion = 1) {
  let rewards = []
    redemptions.forEach((obj) => {
    if (rewardProgramId.toString() === obj.program._id.toString()) {
      let reward = {
        program: obj.program.name,
        redemptionName: obj.redemptionName.name,
        redemptionType: obj.redemptionType.name,
        pointsRequired: obj.pointsRequired * pointconversion,
      }
      rewards.push(reward)
    }
  })
  return rewards
}
