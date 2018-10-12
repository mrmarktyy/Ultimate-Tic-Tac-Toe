// node redshift/monetisedEvents.js
require('dotenv').config()
const json2csv = require('json2csv')
const awsUploadToS3 = require('../utils/awsUploadToS3')
const redshiftQuery = require('../utils/redshiftQuery')
const moment = require('moment')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')

const Log = keystoneShell.list('Log')

async function monetisedRecords () {
  let daysbefore = 1
  let collectionDate = moment().subtract(daysbefore, 'day').format('YYYY-MM-DD')
  const filename = `rc-monetised-events-${collectionDate}`
  let startDate = moment().subtract(daysbefore, 'day').startOf('day').toISOString()
  let endDate = moment().subtract(daysbefore, 'day').endOf('day').toISOString()
  let connection = await mongoosePromise.connect()
  try {
    let logs = await Log.model.find({
        event: 'salesforce-incoming',
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }).lean().exec()
    let records = []
    logs.forEach((record) => {
      JSON.parse(record.message).forEach((item) => {
        let log = {}
        log.createdat = moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss')
        log.gotositeurl = item.RC_Url
        log.uuid = item.RC_Product_ID
        log.vertical = item.RC_Product_Type
        log.gotositeenabled = item.RC_Active
        log.filename = filename
        records.push(log)
      })
    })
    if (records.length > 0) {
      let head = Object.keys(records[0])
      await insertIntoRedshift(records, head, filename, 'rc_monetised_event_history')
    }
    console.log('finished monetised event to redshift')
    connection.close()
  } catch(error) {
    console.log(error)
    return error
  }
}

async function insertIntoRedshift (rows, headers, filename, table) {
  if (rows.length > 0) {
    let csv = json2csv({data: rows, fields: headers, hasCSVColumnTitle: false})
    await awsUploadToS3(`rc_monetised_event_history/${process.env.REDSHIFT_DATABASE}/${filename}`, csv, 'ratecity-redshift')

    let command = `delete from ${table} where filename = $1`
    await redshiftQuery(command, [filename])
    command = `copy ${table} from 's3://ratecity-redshift/rc_monetised_event_history/${process.env.REDSHIFT_DATABASE}/${filename}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' EMPTYASNULL CSV ACCEPTINVCHARS TRUNCATECOLUMNS`
    await redshiftQuery(command)
  }
}

module.exports = async function () {
  await monetisedRecords()
}
