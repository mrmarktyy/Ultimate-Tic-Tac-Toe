require('dotenv').config()
const redshiftQuery = require('../utils/redshiftQuery')
const newRedshiftQuery = require('../utils/newRedshiftQuery')
const moment = require('moment')

module.exports = async function () {
  let startDate = moment().subtract(45, 'days').format('YYYY-MM-DD')
  let s3file = `s3://ratecity-redshift/old_conversions_new/${process.env.NEW_REDSHIFT_DATABASE}/old_conversions_new_${startDate}`
  let unload = `
    unload ('select * from conversions_new where conversion_datetime >= \\'${startDate}%\\' ')
    to '${s3file}'
    credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}'
    GZIP ESCAPE MAXFILESIZE 2 GB ALLOWOVERWRITE
  `
  await redshiftQuery(unload, [])

  let delete45Days = `
    delete from oldredshift_conversions_new
    where conversion_datetime >= ${startDate}
  `
  await newRedshiftQuery(delete45Days, [])

  let insert = `
    copy oldredshift_conversions_new
    from '${s3file}'
    credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}'
    GZIP ESCAPE
  `
  await newRedshiftQuery(insert, [])
}
