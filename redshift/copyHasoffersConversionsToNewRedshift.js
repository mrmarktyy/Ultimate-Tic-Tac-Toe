require('dotenv').config()
const redshiftQuery = require('../utils/redshiftQuery')
const newRedshiftQuery = require('../utils/newRedshiftQuery')
const moment = require('moment')

module.exports = async function () {
  let startDate = moment().subtract(45, 'days').format('YYYY-MM-DD')
  let fileextension = moment().format('YYYY-MM-DD_HH')
  let s3file = `s3://ratecity-redshift/old_hasoffers_conversions/${process.env.NEW_REDSHIFT_DATABASE}/old_hasoffers_conversions_${fileextension}`
  let unload = `
    unload ('select * from hasoffers_conversions where stat_datetime >= \\'${startDate}%\\' ')
    to '${s3file}'
    credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}'
    GZIP ESCAPE ALLOWOVERWRITE PARALLEL OFF
  `
  await redshiftQuery(unload, [])

  let delete45Days = `
    delete from oldredshift_hasoffers_conversions
    where stat_datetime >= ${startDate}
  `
  await newRedshiftQuery(delete45Days, [])

  let insert = `
    copy oldredshift_hasoffers_conversions
    from '${s3file}'
    credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}'
    GZIP ESCAPE
  `
  await newRedshiftQuery(insert, [])
}
