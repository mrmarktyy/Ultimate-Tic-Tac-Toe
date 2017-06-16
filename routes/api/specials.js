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

			if (item.company) {
				specialObj.company = {
					uuid: item.company.uuid,
					name: item.company.name,
					logo: item.company.logo.url,
					slug: item.company.slug
				}
			}

      if (item.product) {
				specialObj.product = {
					uuid: item.product.uuid,
					name: item.product.name,
					slug: item.product.slug,
				}
      }

      if (item.variation) {
				specialObj.variation = {
					uuid: item.variation.uuid,
					name: item.variation.name,
					slug: item.variation.slug
				}
      }

      specialObj.specialsUrl = item.SpecialsUrl
      specialObj.blurb = item.blurb
      specialObj.introText = item.introText
      specialObj.type = item.type
      specialObj.name = item.name
      specialObj.startDate = item.startDate
      specialObj.endDate = item.endDate
			specialObj.promotedOrder = item.promotedOrder

      return specialObj
    })
  }

  res.json(specials)
}

async function getSpecials () {
  var obj = {}
  for (let special of allSpecials) {
    let model = keystone.list(special + 'Special').model
    await model.find({startDate: {$lte: new Date()}, endDate: {$gte: new Date()}}, {updatedBy: 0, updatedAt: 0, createdBy: 0, createdAt: 0}) //eslint-disable-line
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
