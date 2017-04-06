const Pool = require('pg').Pool
const logger = require('../utils/logger')

module.exports = async function (sqlCommand, paramArray = []) {
  const config = {
    user: process.env.REDSHIFT_USERNAME,
    database: process.env.REDSHIFT_DATABASE,
    password: process.env.REDSHIFT_PASSWORD,
    host: process.env.REDSHIFT_HOST,
    port: process.env.REDSHIFT_PORT,
  }
  const pool = new Pool(config)

  try {
    let result =  await pool.query(sqlCommand, paramArray)
    return result.rows
  } catch (err) {
    logger.error(err)
    return err
  }
}
