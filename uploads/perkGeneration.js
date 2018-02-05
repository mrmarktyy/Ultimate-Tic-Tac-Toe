// node uploads/perkGeneration.js
require('dotenv').config()

var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var mongoose = require('mongoose')

const CreditCard = keystoneShell.list('CreditCard')
const PerkType = keystoneShell.list('PerkType')
const Perk = keystoneShell.list('Perk')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    await Perk.model.remove({})
    let perkTypes = await PerkType.model.find().lean().exec()
    let cards = await CreditCard.model.find().lean().exec()

    for(let i = 0; i < cards.length; i++) {
      let card = cards[i]
      let perk = {}
      for (let x = 0; x < perkTypes.length; x++) {
        let currentPerk = perkTypes[x]
        if (card[currentPerk.oldname] === 'YES') {
          let obj = {
            company: mongoose.Types.ObjectId(card.company),
            product: mongoose.Types.ObjectId(card._id),
            perkType: mongoose.Types.ObjectId(currentPerk._id),
            value: 0,
            conditions: null,
            days: null,
            daysConditions: null,
          }
          if (card[`${currentPerk.oldname}Conditions`]) {
            obj.conditions = card[`${currentPerk.oldname}Conditions`]
          }
          if (card[`${currentPerk.oldname}Days`]) {
            obj.days = card[`${currentPerk.oldname}Days`]
            if (card[`${currentPerk.oldname}DaysConditions`]) {
              obj.daysConditions = card[`${currentPerk.oldname}DaysConditions`]
            }
          }
          if (['perksFreeInternationalTravelInsurance'].includes(currentPerk.oldname)) {
            obj.days = card.perksFreeTravelInsuranceDays
            obj.daysConditions = card.perksFreeTravelInsuranceDaysConditions
          }
          console.log(obj)
          let perkInstance = new Perk.model(obj)
          await perkInstance.save((err) => {
            if (err) {
              console.log(err)
            }
          })
        }
      }
    }
    connection.close()
  } catch (error) {
    console.log(error)
    return error
  }
}()
