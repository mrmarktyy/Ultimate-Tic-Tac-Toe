require('dotenv').config()

const logger = require('../utils/logger')
const redshiftQuery = require('../utils/redshiftQuery')
const keystoneShell = require('../utils/keystoneShell')
const mongoosePromise = require('../utils/mongoosePromise')
const Monetize = keystoneShell.list('Monetize')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    let sqlCommand = 'select s1.uuid, s1.cpc_price, s1.cpa_price, s1.cpaa_price, s1.cpl_price FROM salesforce_products s1 JOIN (SELECT uuid, MAX(date_start) date_start FROM salesforce_products GROUP BY uuid) s2 on s1.uuid = s2.uuid AND s1.date_start = s2.date_start'
    let products = await redshiftQuery(sqlCommand, [])
    promises = []
    products.forEach((product) => {
      let paymentType = 'cpc'
      if (product.cpa_price != 0 || product.cpaa_price != 0) {
        paymentType = 'cpa'
      }
      if (product.cpl_price != 0) {
        paymentType = 'cpl'
      }
      promises.push(Monetize.model.update(
        {uuid: product.uuid},
        {$set: {paymentType: paymentType}},
        {upsert: false}
      ))

    })
    await Promise.all(promises)
  } catch (error) {
    logger.error(error)
  }
  connection.close()
}
