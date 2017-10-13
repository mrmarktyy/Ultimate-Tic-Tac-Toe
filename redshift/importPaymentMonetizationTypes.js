require('dotenv').config()

const logger = require('../utils/logger')
const redshiftQuery = require('../utils/redshiftQuery')
const keystoneShell = require('../utils/keystoneShell')
const mongoosePromise = require('../utils/mongoosePromise')
const Monetize = keystoneShell.list('Monetize')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    let sqlCommand = 'select s1.product_uuid, s1.CPC_price, s1.CPA_price, s1.CPAA_price, s1.CPL_price FROM orders s1 JOIN (SELECT product_uuid, MAX(date_start) date_start FROM orders GROUP BY product_uuid) s2 on s1.product_uuid = s2.product_uuid AND s1.date_start = s2.date_start AND s1.active = True'

    let products = await redshiftQuery(sqlCommand, [])
    let promises = []
    products.forEach((product) => {
      let paymentType = 'cpc'

      if (product.cpa_price || product.cpaa_price) {
        paymentType = 'cpa'
      }
      if (product.cpl_price) {
        paymentType = 'cpl'
      }
      promises.push(Monetize.model.update(
        {uuid: product.product_uuid},
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
