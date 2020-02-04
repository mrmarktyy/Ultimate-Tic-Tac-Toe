// node uploads/termDepositTierUuid.js
require('dotenv').config()
var uuid = require('node-uuid')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
const TermDepositTier = keystoneShell.list('TermDepositTier')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    let tiers = await TermDepositTier.model.find({}).lean().exec()
    for (let i=0; i < tiers.length; i++) {
      let record = tiers[i]
      await TermDepositTier.model.findOneAndUpdate(
        { _id: record._id },
        { $set: { uuid: uuid.v4() } },
        { upsert: false },
      ).exec()
    }
    connection.close()
  } catch (error) {
    console.log(error)
    return error
  }
}()
