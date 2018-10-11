// node uploads/monetisedRecords.js
require('dotenv').config()
var fs = require('fs')
const json2csv = require('json2csv')
const moment = require('moment')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')

const Log = keystoneShell.list('Log')

async function monetisedRecords () {
  let connection = await mongoosePromise.connect()
  try {
    let logs = await Log.model.find({event: 'salesforce-incoming'}).sort({createdAt: 1}).lean().exec()
    let records = []
    logs.forEach((record) => {
      JSON.parse(record.message).forEach((item) => {
        let log = {}
        log.createdat = moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss')
        log.gotositeurl = item.RC_Url
        log.uuid = item.RC_Product_ID
        log.vertical = item.RC_Product_Type
        log.gotositeenabled = item.RC_Active
        records.push(log)
      })
    })
    if (records[0]) {
      let head = Object.keys(records[0])
      let csv = json2csv({data: records, fields: head, hasCSVColumnTitle: true})
      fs.writeFile(__dirname + '/../tmp/rc_monetised.csv', csv, (err) => {
        if(err) {
          return console.log(err)
        }
        console.log('The file was saved!')
      })
    }
    console.log('record count ')
    console.log(records.length)
    connection.close()
  } catch(error) {
    console.log(error)
    return error
  }
}

module.exports = async function () {
  await monetisedRecords()
}()
