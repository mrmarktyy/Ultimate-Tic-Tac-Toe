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
