require('dotenv').config()

var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')

var logger = require('../utils/logger')
const Monetize = keystoneShell.list('Monetize')

const products = {
  'Personal Loans': keystoneShell.list('PersonalLoan'),
  'Car Loans': keystoneShell.list('PersonalLoan'),
  'Home Loans': keystoneShell.list('HomeLoanVariation'),
}

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    let monetizes = await Monetize.model.find()
    for (let i = 0; i < monetizes.length; i++) {
      let monetize = monetizes[i]
      let product = await products[monetize.vertical].model.findOne({uuid: monetize.uuid}).populate('company') // eslint-disable-line babel/no-await-in-loop
      // console.log(product.name)
      // console.log(product.company.name)
      if (product && product.name) {
        await Monetize.model.update( // eslint-disable-line babel/no-await-in-loop
          {uuid: monetize.uuid},
          {$set: {productName: product.name, companyName: product.company.name}},
          {}
        ).exec()
      }
    }
    connection.close()
  } catch (error) {
    logger.error(error)
    return error
  }
}()
