require('dotenv').config()

const logger = require('../../utils/logger')
const redshiftQuery = require('../../utils/redshiftQuery')
const moment = require('moment')

module.exports = async function (companyName) {
  leadsCommand = 'SELECT * FROM sale_leads WHERE product_brand = $1'
  let result = await redshiftQuery(leadsCommand, [companyName])
  return result
}
