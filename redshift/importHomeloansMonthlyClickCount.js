require('dotenv').config()
const logger = require('../utils/logger')

const redshiftQuery = require('../utils/redshiftQuery')
const keystoneShell = require('../utils/keystoneShell')
const mongoosePromise = require('../utils/mongoosePromise')
const HomeLoanVariation = keystoneShell.list('HomeLoanVariation')

module.exports = async function () {
  let startDay = new Date()
  startDay.setDate(startDay.getDate() - 30)
  startDay = startDay.getFullYear() + '-' + (startDay.getMonth() + 1) + '-' + startDay.getDate()
  let sqlCommand = 'select product_uuid AS uuid, count(1) AS clicks from apply_clicks where vertical = $1 and datetime >= $2 group by product_uuid'
  let uuidsWithClicks = await redshiftQuery(sqlCommand, ['home loans', startDay])
  await importMonthyClicks(uuidsWithClicks)
}

async function importMonthyClicks (uuidsWithClicks = []) {
  if (uuidsWithClicks.length > 0) {
    let connection = await mongoosePromise.connect()
    try {
      await clearHomeLoanMonthlyClickCounts()
      await updateHomeLoanMonthlyClickCounts(uuidsWithClicks)
    } catch (error) {
      logger.error(error)
      connection.close()
      return error
    }
  }
}

async function clearHomeLoanMonthlyClickCounts () {
  return (HomeLoanVariation.model.update(
    {},
    {$set: {monthlyClicks: 0}},
    {upset: false, multi: true}))
}

async function updateHomeLoanMonthlyClickCounts (uuidsWithClicks) {
  await uuidsWithClicks.forEach(async (record) => {
    await HomeLoanVariation.model.findOneAndUpdate(
      {uuid: record.uuid},
      {$set: {monthlyClicks: record.clicks}},
      {upsert: false})
    .exec((error) => {
      if (error) {
        logger.error(error)
      }
    })
  })
}
