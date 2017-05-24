var keystone = require('keystone')
var logger = require('../../utils/logger')

const allSpecials = [
  'HomeLoan',
  'CreditCard',
  'PersonalLoan',
  'SavingsAccount',
]

exports.list = async function (req, res) {
  let specials = await getSpecials()

  for (let special in specials) {
    specials[special] = specials[special].map((item) => {
      let specialObj = {}

      specialObj.id = item._id

      if (item.product) {
        specialObj.productUUID = item.product.uuid
      }

      if (item.company) {
        specialObj.companyUUID = item.company.uuid
      }

      if (item.variation) {
        specialObj.variationUUID = item.variation.uuid
      }

      specialObj.SpecialsUrl = item.SpecialsUrl
      specialObj.blurb = item.blurb
      specialObj.introText = item.introText
      specialObj.type = item.type
      specialObj.name = item.name

      return specialObj
    })
  }

  res.json(specials)
}

async function getSpecials () {
  var obj = {}
  for (let special of allSpecials) {
    let model = keystone.list(special + 'Special').model
    await model.find({startDate: {$lte: new Date()}, endDate: {$gte: new Date()}}, {updatedBy: 0, updatedAt: 0, createdBy: 0, createdAt: 0, startDate: 0, endDate: 0}) //eslint-disable-line
    .populate('company product variation')
    .lean()
    .exec((err, data) => {
      if (err) {
        logger.error('database error on specials api')
        return 'database error'
      }
      obj[special +  's'] = data
    })
  }
  return obj
}
