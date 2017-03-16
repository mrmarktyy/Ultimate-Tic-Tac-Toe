require('dotenv').config()

const logger = require('../utils/logger')
const Pool = require('pg').Pool

const mongoose = require('mongoose')
const keystone = require('keystone')

keystone.init({
  'auto update': true,
  'session': true,
  'auth': true,
  'user model': 'User',
  'session store': 'mongo',
  'mongo': process.env.MONGO_URI,
})

keystone.import('../models')

module.exports = async function () {
  const config = {
    user: process.env.REDSHIFT_USERNAME,
    database: process.env.REDSHIFT_DATABASE,
    password: process.env.REDSHIFT_PASSWORD,
    host: process.env.REDSHIFT_HOST,
    port: process.env.REDSHIFT_PORT,
  }
  const pool = new Pool(config)

  let startDay = new Date()
  startDay.setDate(startDay.getDate() - 30)
  startDay = startDay.getFullYear() + '-' + (startDay.getMonth() + 1) + '-' + startDay.getDate()
  let sqlCommand = 'select product_uuid AS uuid, count(1) AS clicks from apply_clicks where vertical = $1 and datetime >= $2 group by product_uuid'
  pool.query(sqlCommand, ['home loans', startDay], (err, result) => {
    if (err) {
      logger.error(err)
      return err
    }

    importMonthyClicks(result.rows)
  })
}

async function importMonthyClicks (uuidList = []) {
  if (uuidList.length) {
    mongoose.connect(process.env.MONGO_URI)
    mongoose.connection.on('open', async () => {
      const HomeLoanVariation = keystone.list('HomeLoanVariation')
      try {
        await HomeLoanVariation.model.update(
          {},
          {$set: {monthlyClicks: 0}},
          {upset: false, multi: true})
        .exec((err) => {
          if (err) {
            throw('Clear monthlyClicks Homeloan variations ' + err)
          }
          uuidList.forEach(async (record) => {
            HomeLoanVariation.model.findOneAndUpdate(
              {uuid: record.uuid},
              {$set: {monthlyClicks: record.clicks}},
              {upsert: false})
            .exec((err) => {
              if (err) {
                throw('importing homeloan variation monthly clicks ' + err + ' uuid ' + record.uuid)
              }
            })
          })
        })
      } catch (error) {
        logger.error(error)
        return error
      }

      mongoose.connection.close()
    })
  }
}
