require('dotenv').config()

const logger = require('../../utils/logger')
const redshiftQuery = require('../../utils/redshiftQuery')
const moment = require('moment')

module.exports = async function (companyName, datetime) {
  let leadsCommand
  let result
  if (datetime) {
    leadsCommand = 'SELECT DISTINCT s.*, p.name as product_name FROM sale_leads s LEFT OUTER JOIN reduce_products p ON s.product_uuid = p.uuid WHERE product_brand = $1 AND datetime >= $2'
    result = await redshiftQuery(leadsCommand, [companyName, datetime])
  } else {
    leadsCommand = 'SELECT * FROM sale_leads WHERE product_brand = $1'
    result = await redshiftQuery(leadsCommand, [companyName])
  }
  return result
}
