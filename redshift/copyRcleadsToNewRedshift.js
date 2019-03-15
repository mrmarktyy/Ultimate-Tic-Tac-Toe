require('dotenv').config()
const auroraQuery = require('../utils/auroraQuery')
const newRedshiftQuery = require('../utils/newRedshiftQuery')
const ratecityRedshiftQuery = require('../utils/ratecityRedshiftQuery')
const moment = require('moment')
const json2csv = require('json2csv')
const awsUploadToS3 = require('../utils/awsUploadToS3')

module.exports = async function () {
  let datehour = moment().utc().subtract(1, 'hour').format('YYYY-MM-DD HH:00:00')
  let s3Extension = `old_rc_leads/${process.env.NEW_REDSHIFT_DATABASE}/old_rc_leads_${datehour}`
  let bucket = `ratecity-redshift`
  let s3file = `s3://${bucket}/${s3Extension}`
  let unload = `
    select
      id,
      device_id,
      email,
      type,
      generated_at,
      broker,
      vertical,
      click_id,
      to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
      to_char(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at,
      preferred_contact,
      utm_source,
      utm_campaign,
      utm_medium,
      api_key,
      substring(product::varchar from 1 for 4095) as products,
      substring(product ->> 'applied' from 1 for 2045) as applied,
      substring(product ->> 'attributes' from 1 for 2040) as attributes,
      substring(product ->> 'scores'  from 1 for 2045) as scores,
      generated_source
    from rc_leads
    where updated_at >= \'${datehour}\'
  `
  let leads = await auroraQuery(unload, [])
  if (leads.length) {
    let csv = json2csv({
          data: leads,
          fields: Object.keys(leads[0]),
          hasCSVColumnTitle: false,
          quotes: String.fromCharCode(7),
    })
    await awsUploadToS3(s3Extension, csv, 'ratecity-redshift')

    let deleteHourRecords = `
      delete from aurora_rc_leads
      where updated_at >= \'${datehour}\'
    `
    await newRedshiftQuery(deleteHourRecords, [])
    await ratecityRedshiftQuery(deleteHourRecords, [])

    let insert = `
      copy aurora_rc_leads
      from '${s3file}'
      credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}'
      CSV QUOTE '${String.fromCharCode(7)}' TRUNCATECOLUMNS EMPTYASNULL
    `
    await newRedshiftQuery(insert, [])
    await ratecityRedshiftQuery(insert, [])

    let deleteOldDupes = `
      delete from aurora_rc_leads
      where updated_at != (
        select max(newrec.updated_at)
        from aurora_rc_leads newrec
        where newrec.id = aurora_rc_leads.id
      )
    `
    await newRedshiftQuery(deleteOldDupes, [])
    await ratecityRedshiftQuery(deleteOldDupes, [])
  }
}
