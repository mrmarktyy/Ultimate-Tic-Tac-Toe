// node --harmony_async_await uploads/superUUIDUpdate.js
require('dotenv').config()
var uuid = require('node-uuid')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')

const Superannuation = keystoneShell.list('Superannuation')

async function repopulateUuids (findClause) {
  let connection = await mongoosePromise.connect()
  try {
    let products = await Superannuation.model.find(findClause).lean().exec()

    for (let i = 0; i < products.length; i++) {
      let item = products[i]
      await Superannuation.model.update({uuid: item.uuid}, {$set: {uuid: uuid.v4(), oldUuid: item.uuid}}, {}) // eslint-disable-line babel/no-await-in-loop
    }
    connection.close()
  } catch (error) {
    console.log(error)
    return error
  }
}

module.exports = async function () {
  await repopulateUuids({superannuation: true})
  await repopulateUuids({pension: true})
}()
