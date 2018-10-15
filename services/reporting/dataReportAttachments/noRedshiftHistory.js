require('dotenv').config()

const redshiftQuery = require('../../../utils/redshiftQuery')
const json2csv = require('json2csv')
const fs = require('fs')
const moment = require('moment')

async function redshiftHistory (filePath) {
  let rollingDays = 30
  let monthBefore = moment().subtract(rollingDays, 'day')

  let tableListQuery = 'select distinct(tablename) from pg_table_def ' +
    ' where schemaname = $1 ' +
    ' and tablename like $2 ' +
    ' and not like $3 order by tablename'
  let tableNames = await redshiftQuery(tableListQuery, ['public', '%history', '%_event%'])
  let badtables = []
  for (let i=0; i < tableNames.length; i++) {
    let table = tableNames[i].tablename
    let query = `select collectiondate, count(1) as count from ${table} where collectiondate >= '${monthBefore.format('YYYY-MM-DD')}' group by collectiondate order by collectiondate desc`
    let tableResults = await redshiftQuery(query, [])

    let day = moment().subtract(1, 'day')
    for (let x=0; x < tableResults.length; x++)  {
      let tableday = tableResults[x]
      let collectiondate = moment(tableday.collectiondate).format('YYYY-MM-DD')
      while(collectiondate !== day.format('YYYY-MM-DD')) {
        badtables.push({tablename: table, missingcollectiondate: day.format('YYYY-MM-DD')})
        day = day.subtract(1, 'day')
      }
      day = moment(collectiondate).subtract(1, 'day')
    }
  }
  let result = null
  if (badtables.length) {
    let csv = json2csv({data: badtables})
    let fileName = `RedshiftHistoryMissingDaysInLast30.csv`
    fs.writeFileSync(filePath + fileName, csv)
    result = {path: `${filePath}${fileName}`}
  }
  return result
}

module.exports = redshiftHistory
