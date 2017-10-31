var keystone = require('keystone')
var CompanyService = require('../../services/CompanyService')

const CreditCard = keystone.list('CreditCard')
const Redemption = keystone.list('Redemption')
const PartnerConversion = keystone.list('PartnerConversion')
const monetizedCollection = require('./monetizedCollection')

exports.list = async function (req, res) {
  let removeFields = { updatedAt: 0, updatedBy: 0, isMonetized: 0 }
  let monetizedList = await monetizedCollection('Credit Cards')
  let partnerConversions = await PartnerConversion.model.find()
    .populate('rewardProgram partnerProgram')
    .lean()
    .exec()
  let redemptions = await Redemption.model.find()
    .populate('redemptionName redemptionType program')
    .lean()
    .exec()
  let creditcards = await CreditCard.model
    .find({ $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] }, removeFields)
    .populate('company rewardProgram', '-updatedAt -updatedBy')
    .lean()
    .exec()

  creditcards.forEach((card) => {
    card.company = CompanyService.fixLogoUrl(card.company)

    let monetize = monetizedList[card._id]
    card.gotoSiteUrl = monetize ? monetize.applyUrl : null
    card.gotoSiteEnabled = monetize ? monetize.enabled : false
    card.paymentType = monetize ? monetize.paymentType : null

    if (card.rewardProgram) {
      let rewards = []
      redemptions.forEach((obj) => {
        if (card.rewardProgram._id.toString() === obj.program._id.toString()) {
          rewards.push({program: obj.program.name, redemptionName: obj.redemptionName.name, redemptionType: obj.redemptionType.name})
        }
      })
      card.rewardProgram.redemptions = rewards
      let partners = []
      partnerConversions.forEach((obj) => {
        if (card.rewardProgram._id.toString() === obj.rewardProgram._id.toString()) {
          partners.push({partnerProgram: obj.rewardProgram.name, conversionRate: obj.conversionRate})
        }
      })
      card.rewardProgram.partners = partners
    }
  })
  res.jsonp(creditcards)
}

