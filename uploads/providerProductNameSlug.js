// node uploads/providerProductNameSlug.js
require('dotenv').config()

var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var utils = keystoneShell.utils

const ProviderProductName = keystoneShell.list('ProviderProductName')

async function providerProductNameSlug () {
let connection = await mongoosePromise.connect()
  try {
    let providers = await ProviderProductName.model.find()
    for (let i = 0; i < providers.length; i++) {
      let provider = providers[i]
      await ProviderProductName.model.findOneAndUpdate(
        { uuid: provider.uuid },
        {$set: { slug: utils.slug(provider.name.toLowerCase()) }},
        {}).exec()
    }
    connection.close()
  } catch (error) {
    console.log(error)
    return error
  }
}

module.exports = async function () {
  await providerProductNameSlug()
}()
