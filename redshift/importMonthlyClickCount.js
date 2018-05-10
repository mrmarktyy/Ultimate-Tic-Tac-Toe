require('dotenv').config()
const logger = require('../utils/logger')

const redshiftQuery = require('../utils/redshiftQuery')
const keystoneShell = require('../utils/keystoneShell')
const mongoosePromise = require('../utils/mongoosePromise')
const salesforceVerticals = require('../models/helpers/salesforceVerticals')

module.exports = async function () {
  let startDay = new Date()
  startDay.setDate(startDay.getDate() - 30)
  startDay = startDay.getFullYear() + '-' + (startDay.getMonth() + 1) + '-' + startDay.getDate()
  let sqlCommand = 'select vertical, product_uuid AS uuid, count(1) AS clicks from apply_clicks where datetime >= $1 group by vertical, product_uuid'
  let uuidsWithClicks = await redshiftQuery(sqlCommand, [startDay])

  await importMonthyClicks(uuidsWithClicks)
}

async function importMonthyClicks (uuidsWithClicks = []) {
  if (uuidsWithClicks.length > 0) {
    let connection = await mongoosePromise.connect()
    try {
      const verticalClicks = uuidsWithClicks.reduce((all, item) => {
        all[item.vertical] = (all[item.vertical] || []).concat(
          {
            uuid: item.uuid,
            clicks: item.clicks,
          }
        )
        return all
      }, {})
      let verticalModelMap = verticalToModel()
      for (let vertical in verticalClicks) {
        const model = verticalModelMap[vertical]
        const verticalModel = keystoneShell.list(`${model}`)
        const verticalUuids = verticalClicks[vertical].map((item) => item.uuid)
        if (model) {
          await clearMonthlyClickCounts(verticalModel, verticalUuids)
          await updateMonthlyClickCounts(verticalClicks[vertical], verticalModel)
        }
      }
      connection.close()
    } catch (error) {
      logger.error(error)
      connection.close()
      return error
    }
  }
}

function verticalToModel () {
  let obj = {}
  Object.keys(salesforceVerticals).forEach((vertical) => {
    if (vertical === 'Savings Accounts') {
      obj[vertical.toLowerCase()] = salesforceVerticals[vertical].collection
    } else {
      obj[salesforceVerticals[vertical].salesforceVertical.toLowerCase()] = salesforceVerticals[vertical].collection
    }
  })
  return obj
}

async function clearMonthlyClickCounts (verticalModel, uuids) {
  return (verticalModel.model.update(
    {uuid: {$in: uuids}},
    {$set: {monthlyClicks: 0}},
    {upsert: false, multi: true}))
}

async function updateMonthlyClickCounts (verticalClicks, verticalModel) {
  let promises = []
  verticalClicks.forEach((record) => {
    promises.push(verticalModel.model.findOneAndUpdate(
      {uuid: record.uuid},
      {$set: {monthlyClicks: record.clicks}},
      {upsert: false})
    )
  })
  try {
    await Promise.all(promises)
  } catch (error) {
    /* If something fails, log the error, but don't fail the entire job */
    logger.error(error)
  }
}
