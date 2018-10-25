require('dotenv').config()

const schedule = require('node-schedule')
const logger = require('../utils/logger')
const resqueUtil = require('./util')

const scheduler = resqueUtil.scheduler
const worker = resqueUtil.worker
const queue = resqueUtil.queue
const stagingEnv = new RegExp('staging')

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

  // Daily
  schedule.scheduleJob('00 01 * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'monetisedEventsToRedshift')
    }
  })
  schedule.scheduleJob('50 5 * * 1-5', async () => {
    if (scheduler.master && !stagingEnv.exec(process.env.BLAZE)) {
      await queue.enqueue('ultimate', 'emailDataReport')
    }
  })
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
  schedule.scheduleJob('39 15 * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'blazePages')
    }
  })
  schedule.scheduleJob('10 2 * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'ingestLongtailux')
    }
  })
  schedule.scheduleJob('20 2 * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'ingestPages')
    }
  })
  schedule.scheduleJob('10 11 * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'copyConversionsNewToNewRedshiftJob')
    }
  })
  // hourly
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
  schedule.scheduleJob('05 * * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'copyOldApplyClicksToNewRedshiftJob')
    }
  })
  schedule.scheduleJob('04 * * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'copyRcLeadsToNewRedshiftJob')
    }
  })

  schedule.scheduleJob('00 * * * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'copyHasoffersConversionsToNewRedshiftJob')
    }
  })
  // monthy
  schedule.scheduleJob('0 6 1 * *', async () => {
    if (scheduler.master) {
      await queue.enqueue('ultimate', 'emailMonthlyClicks')
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
