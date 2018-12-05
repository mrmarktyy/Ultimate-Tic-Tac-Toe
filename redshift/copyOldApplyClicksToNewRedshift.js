require('dotenv').config()
const redshiftQuery = require('../utils/redshiftQuery')
const newRedshiftQuery = require('../utils/newRedshiftQuery')
const moment = require('moment')

module.exports = async function () {
  let datehour = moment().subtract(1, 'hour').format('YYYY-MM-DD HH')
  let s3file = `s3://ratecity-redshift/old_apply_clicks_raw/${process.env.NEW_REDSHIFT_DATABASE}/old_apply_clicks_raw_${datehour}`

  let unload = `
    unload ('select * from apply_clicks_raw where inserted_at like \\'${datehour}%\\' ')    to '${s3file}'
    credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}'
    GZIP ESCAPE ALLOWOVERWRITE PARALLEL OFF
  `
  await redshiftQuery(unload, [])

  let insert = `
    copy oldredshift_apply_clicks_raw
    from '${s3file}'
    credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}'
    GZIP ESCAPE
  `
  await newRedshiftQuery(insert, [])
}
