// node --harmony_async_await uploads/familyUUIDGeneration.js
require('dotenv').config()
var uuid = require('node-uuid')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var mongoose = require('mongoose')
var Family = keystoneShell.list('HomeLoanFamily')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    let families = await Family.model.find().exec()

    let newUuid
    for (let i = 0; i < families.length; i++) {
      let family = families[i]
      newUuid = uuid.v4()
      await Family.model.update({_id: mongoose.Types.ObjectId(family._id)}, {$set: {uuid: newUuid}}, {}) // eslint-disable-line babel/no-await-in-loop
    }
    connection.close()
  } catch (error) {
    return error
  }
}()
