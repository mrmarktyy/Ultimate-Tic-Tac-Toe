var keystone = require('keystone')
var CompanyService = require('../../services/CompanyService')

const CreditCard = keystone.list('CreditCard')
const Redemption = keystone.list('Redemption')
const EarnRate = keystone.list('EarnRate')
const PartnerConversion = keystone.list('PartnerConversion')
const PerkType = keystone.list('PerkType')
const Perk = keystone.list('Perk')
const CompanyCreditCard = keystone.list('CompanyCreditCard')

const monetizedCollection = require('./monetizedCollection')
const recommendedMultiplier = require('../../utils/recommendedMultiplier').multiplier

const DEFAULT_OLD_PERKS = {
  perksFreeDomesticTravelInsurance: 'NO',
  perksFreeDomesticTravelInsuranceConditions: '',
  perksFreeInternationalTravelInsurance: 'NO',
  perksFreeInternationalTravelInsuranceConditions: '',
  perksFreeTravelInsuranceDays: null,
  perksFreeTravelInsuranceDaysConditions: '',
  perksFreeSupplementaryCards: 'NO',
  perksFreeSupplementaryCardsConditions: '',
  perksPurchaseProtectionDays: null,
  perksPurchaseProtectionConditions: '',
  perksPriceGuarantee: 'NO',
  perksPriceGuaranteeConditions: '',
  perksExtendedWarranty: 'NO',
  perksExtendedWarrantyConditions: '',
  perksRentalCarExcessInsurance: 'NO',
  perksRentalCarExcessInsuranceConditions: '',
  perksVIPSeating: 'NO',
  perksVIPSeatingConditions: '',
  perksConcierge: 'NO',
  perksConciergeConditions: '',
  perksSpecialEvents: 'NO',
  perksSpecialEventsConditions: '',
  perksPartnerDiscounts: 'NO',
  perksPartnerDiscountsConditions: '',
  perksAirportLounge: 'NO',
  perksAirportLoungeConditions: '',
}

exports.list = async function (req, res) {
  let removeFields = { updatedAt: 0, updatedBy: 0, isMonetized: 0, __v: 0, createdAt: 0, createdBy: 0 }
  let removePopulatedFields = '-updatedAt -updatedBy -__v  -createdAt -createdBy'
  let monetizedList = await monetizedCollection('Credit Cards')
  let companyVerticalData = await CompanyCreditCard.model.find().populate('big4ComparisonProduct').lean().exec()
  companyVerticalData.forEach((obj) => {
     obj.big4ComparisonProductUuid = obj.big4ComparisonProduct ? obj.big4ComparisonProduct.uuid : null
  })
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

  let perks = await Perk.model
    .find({}. removeFields)
    .populate('perkType', removePopulatedFields)
    .lean()
    .exec()
  let perkTypes = (await PerkType.model
    .find()
    .lean()
    .exec()).map((perk) => {
      return perk.name
    })

  let cards = []
  creditcards.forEach((card) => {
    let company = CompanyService.fixLogoUrl(card.company)
    if (company.logo && company.logo.url) {
      company.logo = company.logo.url
    }
    card.company  = company
    card.companyVertical = companyVerticalData

    let monetize = monetizedList[card._id]
    card.gotoSiteUrl = monetize ? monetize.applyUrl : null
    card.gotoSiteEnabled = monetize ? monetize.enabled : false
    card.paymentType = monetize ? monetize.paymentType : null
    card.cardArt = card.cardArt ? fixCardArtUrl(card.cardArt.url) : null

    card.foreignExchangeFeeMCDollar = card.foreignExchangeFeeMcDollar
    card.foreignExchangeFeeMCPercent= card.foreignExchangeFeeMcPercent
    card.foreignExchangeFeeMCATM = card.foreignExchangeFeeMcATM
    delete card.foreignExchangeFeeMcDollar
    delete card.foreignExchangeFeeMcPercent
    delete card.foreignExchangeFeeMcATM
    card.balanceTransferConditions = card.balanceTransferConditions === '' ? null : card.balanceTransferConditions

    card.estimatedForeignAtmCost = estimatedForeignAtmCost(card)
    card.popularityScore = (card.monthlyClicks ? card.monthlyClicks * recommendedMultiplier : 0)
    delete card.monthlyClicks

    card = populateOldperks(card, perks)
    card.perks = populatePerks (card, perks, perkTypes)

    if (card.rewardProgram) {
      card.rewardProgram.redemptions = redemptionCalculation(redemptions, card.rewardProgram._id.toString())
      card.isFrequentFlyer = card.rewardProgram.isFrequentFlyer || false
      let partners = []
      partnerConversions.forEach((obj) => {
        if (card.rewardProgram._id.toString() === obj.rewardProgram._id.toString()) {
          let partnerObject = {
            partnerProgram: obj.partnerProgram.shortName,
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
    cards.push(card)
  })
  res.jsonp(cards)
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
      let pointsRequired = obj.pointsRequired * pointconversion
      let reward = {
        program: obj.program.name,
        redemptionName: obj.redemptionName.name,
        redemptionType: obj.redemptionType.name,
        pointsRequired: pointsRequired,
        dollarPerPoint: obj.redemptionName.price ? (obj.redemptionName.price / parseFloat(pointsRequired)).toFixed(4) : 0,
        priceMethod: obj.redemptionName.priceMethod,
      }
      rewards.push(reward)
    }
  })
  return rewards
}

function fixCardArtUrl (url) {
  if (url) {
    url = url
    	.replace(/^https?:/, '')
    	.replace('res.cloudinary.com', '//production-ultimate-assets.ratecity.com.au')
  }
  return url
}

function populateOldperks (card, perks) {
  let oldPerkNames = Object.keys(DEFAULT_OLD_PERKS)
  let cardPerks = perks.filter((perk) => {
    return perk.product.toString() === card._id.toString()
  })

  let perksAvailable = {}
  cardPerks.forEach((perk) => {
    perksAvailable[perk.perkType.oldname] = 'YES'
    if (oldPerkNames.includes(`${perk.perkType.oldname}Days`)) {
      perksAvailable[`${perk.perkType.oldname}Days`] = perk.days
    }
    if  (oldPerkNames.includes(`${perk.perkType.oldname}Conditions`)) {
      perksAvailable[`${perk.perkType.oldname}Conditions`] = perk.conditions
    }
    if (perk.perkType.oldname === 'perksFreeInternationalTravelInsurance') {
      perksAvailable.perksFreeTravelInsuranceDays = perk.days
      perksAvailable.perksFreeTravelInsuranceDaysConditions = perk.daysConditions
    }
  })
  return  Object.assign({}, card, DEFAULT_OLD_PERKS, perksAvailable)
}

function populatePerks (card, perks, perkTypes) {
  let perkList = []
  let cardPerks = perks.filter((perk) => {
    return perk.product.toString() === card._id.toString()
  })
  for (let name of perkTypes) {
    let cardPerk = cardPerks.find((perk) => {return perk.perkType.name === name})
    let item = {name: name, active: false, conditions: '', days: null, daysConditions: '', assumptions: ''}
    if (cardPerk) {
      item[name] = name
      item.active = true
      item.conditions = cardPerk.conditions
      item.days = cardPerk.days
      item.daysConditions = cardPerk.daysConditions
      item.assumptions = cardPerk.perkType.assumptions
    }
    perkList.push(item)
  }
  return perkList
}
