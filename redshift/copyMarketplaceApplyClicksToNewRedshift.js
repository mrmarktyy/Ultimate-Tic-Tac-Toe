require('dotenv').config()
const auroraQuery = require('../utils/auroraQuery')
const newRedshiftQuery = require('../utils/newRedshiftQuery')
const moment = require('moment')
const json2csv = require('json2csv')
const awsUploadToS3 = require('../utils/awsUploadToS3')

module.exports = async function () {
  try {
    let datehour = moment().utc().subtract(1, 'hour').format('YYYY-MM-DD HH:00:00')
    let s3Extension = `old_marketplace_apply_clicks/${process.env.NEW_REDSHIFT_DATABASE}/old_marketplace_apply_clicks_${datehour}`
    let bucket = `ratecity-redshift`
    let s3file = `s3://${bucket}/${s3Extension}`
    let unload = `
      select
        lead_id,
        device_id,
        product_uuid,
        email,
        to_char(created_at, 'YYYY-MM-DD HH24:MI:SSOF') as created_at,
        to_char(updated_at, 'YYYY-MM-DD HH24:MI:SSOF') as updated_at
      from rc_marketplace_apply_clicks
      where updated_at >= \'${datehour}\'
    `
    let marketplace = await auroraQuery(unload, [])
    if (marketplace.length > 0) {
      let csv = json2csv({
        data: marketplace,
        fields: Object.keys(marketplace[0]),
        hasCSVColumnTitle: false,
        quotes: String.fromCharCode(7),
      })
      await awsUploadToS3(s3Extension, csv, 'ratecity-redshift')

      let deleteHourRecords = `
        delete from aurora_marketplace_apply_clicks
        where updated_at >= \'${datehour}\'
      `
      await newRedshiftQuery(deleteHourRecords, [])

      let insert = `
        copy aurora_marketplace_apply_clicks
        from '${s3file}'
        credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}'
        CSV QUOTE '${String.fromCharCode(7)}' TRUNCATECOLUMNS
      `
      await newRedshiftQuery(insert, [])
    }
  } catch(error) {
    console.log(error)
  }
}
