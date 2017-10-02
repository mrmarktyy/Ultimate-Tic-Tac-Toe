require('dotenv').config()

const schedule = require('node-schedule')
const logger = require('../utils/logger')
const resqueUtil = require('./util')

const scheduler = resqueUtil.scheduler
const worker = resqueUtil.worker
const queue = resqueUtil.queue

scheduler.connect(() => {
  scheduler.start()
})

worker.connect(() => {
  worker.workerCleanup()
  worker.start()
})

queue.connect(() => {
  queue.cleanOldWorkers(120000, (error, data) => {
    if (Object.keys(data).length > 0) {
      logger.info('cleaned old workers')
    }
    if (error) {
      logger.error(error)
    }
  })

  // Daily
  schedule.scheduleJob('47 18 * * *', () => {
    if (scheduler.master) {
      queue.enqueue('ultimate', 'personalLoansToRedshift')
    }
  })
  schedule.scheduleJob('00 7 * * *', () => {
    if (scheduler.master) {
      queue.enqueue('ultimate', 'homeLoansMonthlyClickCount')
    }
  })
  schedule.scheduleJob('15 7 * * *', () => {
    if (scheduler.master) {
      queue.enqueue('ultimate', 'paymentMonetizationTypes')
    }
  })
  schedule.scheduleJob('52 18 * * *', () => {
   if (scheduler.master) {
      queue.enqueue('ultimate', 'homeLoansToRedshift')
    }
  })
  schedule.scheduleJob('57 18 * * *', () => {
   if (scheduler.master) {
      queue.enqueue('ultimate', 'savingsAccountsToRedshift')
    }
  })
  schedule.scheduleJob('25 * * * *', () => {
    if (scheduler.master) {
      queue.enqueue('ultimate', 'salesforceCompanies')
    }
  })
  schedule.scheduleJob('28 * * * *', () => {
    if (scheduler.master) {
      queue.enqueue('ultimate', 'salesforceProducts')
    }
  })
  // monthy
  schedule.scheduleJob('0 6 1 * *', () => {
    if (scheduler.master) {
      queue.enqueue('ultimate', 'emailMonthlyClicks')
    }
  })

  schedule.scheduleJob('39 15 * * *', () => {
    if (scheduler.master) {
      queue.enqueue('ultimate', 'blazePages')
    }
  })
})

const shutdown = () => {
  scheduler.end(() => {
    worker.end(() => {
      logger.info('resque process exited cleanly')
      process.exit()
    })
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
