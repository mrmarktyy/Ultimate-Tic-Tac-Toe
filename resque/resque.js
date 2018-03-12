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

async function startResque () {
  await worker.connect()
  await worker.workerCleanup()
  await worker.start()

    // START A SCHEDULER //
  await scheduler.connect()
  scheduler.start()

  await queue.connect()
  await queue.cleanOldWorkers(120000)
  logger.info('cleaned old workers')
  // queue.cleanOldWorkers(120000, (error, data) => {
  //   if (Object.keys(data).length > 0) {
  //     logger.info('cleaned old workers')
  //   }
  //   if (error) {
  //     logger.error(error)
  //   }
  // })

  // Daily
  schedule.scheduleJob('47 18 * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'personalLoansToRedshift')
    }
  })
  schedule.scheduleJob('00 7 * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'monthlyClickCount')
    }
  })
  schedule.scheduleJob('15 7 * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'paymentMonetizationTypes')
    }
  })
  schedule.scheduleJob('52 18 * * *', async () => {
   if (scheduler.master) {
      await queue.enqueue('ultimate', 'homeLoansToRedshift')
    }
  })
  schedule.scheduleJob('00 19 * * *', async () => {
   if (scheduler.master) {
      await queue.enqueue('ultimate', 'savingsAccountsToRedshift')
    }
  })
  schedule.scheduleJob('20 19 * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'creditCardsToRedshift')
    }
  })
  schedule.scheduleJob('40 19 * * *', async () => {
   if (scheduler.master) {
      await queue.enqueue('ultimate', 'bankAccountsToRedshift')
    }
  })
  schedule.scheduleJob('00 20 * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'termDepositsToRedshift')
    }
  })
  schedule.scheduleJob('25 * * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'salesforceCompanies')
    }
  })
  schedule.scheduleJob('28 * * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'salesforceProducts')
    }
  })
  // monthy
  schedule.scheduleJob('0 6 1 * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'emailMonthlyClicks')
    }
  })

  schedule.scheduleJob('39 15 * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'blazePages')
    }
  })

  const shutdown = async () => {
    await scheduler.end()
    await worker.end()
    logger.info('resque process exited cleanly')
    process.exit(0)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

startResque()
