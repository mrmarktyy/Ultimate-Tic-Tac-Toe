var keystone = require('keystone')
var logger = require('../../utils/logger')
const Redemption = keystone.list('Redemption')

const allSpecials = [
  'HomeLoan',
  'CreditCard',
  'PersonalLoan',
  'SavingsAccount',
	'BankAccount',
	'TermDeposit',
]

exports.list = async function (req, res) {
  let specials = await getSpecials()
  let redemption = await getRedemptionPoints()
  let vertical = req.params.vertical || ''

  for (let special in specials) {
    specials[special] = specials[special].map((item) => {
      let specialObj = {}

      specialObj.id = item._id

			if (item.company) {
				specialObj.company = {
					uuid: item.company.uuid,
					name: item.company.name,
					logo: item.company.logo.url,
					slug: item.company.slug,
				}
			}

			if (item.product) {
				specialObj.product = {
					uuid: item.product.uuid,
					name: item.product.name,
					slug: item.product.slug,
				}
				if (special === 'PersonalLoans') {
					specialObj.product.isPersonalLoan = item.product.isPersonalLoan === 'YES'
					specialObj.product.isCarLoan = item.product.isCarLoan === 'YES'
				}
			}
      if (item.variation) {
				specialObj.variation = {
					uuid: item.variation.uuid,
					name: item.variation.name,
					slug: item.variation.slug,
				}
      }

      specialObj.specialsUrl = item.SpecialsUrl
      specialObj.blurb = item.blurb
      specialObj.introText = item.introText
      specialObj.type = item.type
      specialObj.defaultType = item.defaultType ? item.defaultType : null
      specialObj.name = item.name
      specialObj.startDate = item.startDate
      specialObj.endDate = item.endDate
      specialObj.promotedOrder = item.promotedOrder
      specialObj.cashBack = item.cashBack
      specialObj.bonusFFPoints = item.bonusFFPoints || null
      specialObj.bonusFFPointsPer100kLoan = item.bonusFFPointsPer100kLoan || null
      specialObj.FFRedemptionProgram = item.FFRedemptionProgram ? item.FFRedemptionProgram.name : null
      specialObj.pointsRequired = getPoints(item, redemption)
      specialObj.isOngoingSpecial = item.isOngoingSpecial
      return specialObj
    })
  }

  res.json(specials[vertical] || specials)
}

async function getSpecials () {
  var obj = {}
  for (let special of allSpecials) {
    let model = keystone.list(special + 'Special').model
    await model.find({
      $or: [
        {startDate: {$lte: new Date()}, $and: [{endDate: {$exists: true}}, {endDate: {$gte: new Date()}}]},
        {startDate: {$lte: new Date()}, endDate: null},
        {startDate: {$lte: new Date()}, endDate: {$exists: false}},
      ],
		}, {updatedBy: 0, updatedAt: 0, createdBy: 0, createdAt: 0}) //eslint-disable-line
    .populate('company product variation FFRedemptionProgram')
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

async function getRedemptionPoints () {
  let obj = {}
  let records = await Redemption.model.find().populate('redemptionName').lean()
  records.forEach((item) => {
    if (['$100 cash back', '$100 gift card'].indexOf(item.redemptionName.name) >= 0) {
      if (!obj[item.program.toString()]) {
        obj[item.program.toString()] = {}
      }
      obj[item.program.toString()][item.redemptionName.name] = item.pointsRequired
    }
  })
  return obj
}

function getPoints (record, redemption) {
  if (record.FFRedemptionProgram) {
    return redemption[record.FFRedemptionProgram._id]['$100 gift card'] || redemption[record.FFRedemptionProgram._id]['$100 cash back'] || 0
  }
  return 0
}
