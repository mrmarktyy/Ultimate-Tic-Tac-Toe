const Pool = require('pg').Pool
const logger = require('../utils/logger')

module.exports = async function (sqlCommand, paramArray = []) {
  const config = {
    user: process.env.AURORA_USER,
    database: process.env.AURORA_DATABASE,
    password: process.env.AURORA_PASSWORD,
    host: process.env.AURORA_HOST,
    port: process.env.AURORA_PORT,
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
