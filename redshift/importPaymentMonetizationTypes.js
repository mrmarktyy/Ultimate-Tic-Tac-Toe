require('dotenv').config()

const logger = require('../utils/logger')
const redshiftQuery = require('../utils/ratecityRedshiftQuery')
const keystoneShell = require('../utils/keystoneShell')
const mongoosePromise = require('../utils/mongoosePromise')
const Monetize = keystoneShell.list('Monetize')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
		let sqlCommand = `
			select s1.product_uuid,
				 case lower(monetisation_type)
						 when 'cpa/cpaa' then 'cpa'
						 when 'cpaa' then 'cpa'
						 else lower(monetisation_type)
				 end monetisation_type
			from r_orders s1
			inner join (
					select product_uuid, min(date_start) date_start
					from r_orders
					where monetisation_type in ('CPC', 'CPA', 'CPAA', 'CPA/CPAA', 'CPL')
					and product_uuid <> ''
					and order_op_subline_status = true
					group by product_uuid) s2
			on s1.product_uuid = s2.product_uuid
			and s1.date_start = s2.date_start
			and s1.order_op_subline_status = true
			and s1.product_uuid <> ''
		`
    let products = await redshiftQuery(sqlCommand, [])
    let promises = []
    products.forEach((product) => {
      promises.push(Monetize.model.update(
        {uuid: product.product_uuid},
        {$set: {paymentType: product.monetisation_type}},
        {upsert: false}
      ))

    })
    await Promise.all(promises)
  } catch (error) {
    logger.error(error)
  }
  connection.close()
}
