require('dotenv').config()
const Pool = require('pg').Pool
const logger = require('../utils/logger')

module.exports = async function (sqlCommand, paramArray = []) {
  const config = {
    user: process.env.RATECITY_REDSHIFT_USERNAME,
    database: process.env.RATECITY_REDSHIFT_DATABASE,
    password: process.env.RATECITY_REDSHIFT_PASSWORD,
    host: process.env.RATECITY_REDSHIFT_HOST,
    port: process.env.RATECITY_REDSHIFT_PORT,
  }
  const pool = new Pool(config)
  var client = await pool.connect()
  try {
    let result =  await client.query(sqlCommand, paramArray)
    client.release()
    return result.rows
  } catch (err) {
    logger.error(err)
    client.release()
    return err
  }
}
