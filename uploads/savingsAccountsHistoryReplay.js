// node --harmony_async_await uploads/savingsAccountsHistoryReplay.js
require('dotenv').config()

const redshiftQuery = require('../utils/redshiftQuery')

module.exports = async function () {
  let collectiondates = ['2017-11-13', '2017-11-14', '2017-11-15', '2017-11-22']
  for (let i = 0; i < collectiondates.length; i++) {
    let collectionDate = collectiondates[i]
    let filename = `savings-accounts-${collectionDate}`
    let filenameTier = `savings-account-tiers-${collectionDate}`
    await insertIntoRedshift(filename, 'savings_accounts_history') // eslint-disable-line babel/no-await-in-loop
    await insertIntoRedshift(filenameTier, 'savings_accounts_tiers_history') // eslint-disable-line babel/no-await-in-loop
  }
}()

async function insertIntoRedshift (filename, table) {
  let command = `delete from ${table} where filename = $1`
  await redshiftQuery(command, [filename])
  command = `copy ${table} from 's3://ratecity-redshift/savings-accounts-history/${process.env.REDSHIFT_DATABASE}/${filename}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' EMPTYASNULL CSV ACCEPTINVCHARS TRUNCATECOLUMNS`
  await redshiftQuery(command)
}
