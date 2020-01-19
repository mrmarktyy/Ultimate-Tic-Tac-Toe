// node uploads/personalloanVariationUuid.js
require('dotenv').config()
var uuid = require('node-uuid')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
const PersonalLoanVariation = keystoneShell.list('PersonalLoanVariation')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    let variations = await PersonalLoanVariation.model.find({}).lean().exec()
    for (let i=0; i < variations.length; i++) {
      let record = variations[i]
      await PersonalLoanVariation.model.findOneAndUpdate(
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
