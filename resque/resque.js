require('dotenv').config()

const Resque = require('node-resque')
const schedule = require('node-schedule')
const logger = require('../utils/logger')

var importHomeloansMonthlyClickCount = require('../redshift/importHomeloansMonthlyClickCount')
var importPaymentMonetizationTypes = require('../redshift/importPaymentMonetizationTypes')
var loadPersonalLoansToRedshift = require('../redshift/personalloans')

const connectionDetails = {
  pkg: 'ioredis',
  host: process.env.REDIS_HOST,
  port: 6379,
  database: 5,
}

const jobs = {
  'loadPersonalLoansToRedshift': {
    plugins: ['queueLock'],
    perform: async (done) => {
      try {
        await loadPersonalLoansToRedshift()
        done()
      } catch (error) {
        done(error.message)
      }
    },
  },
  'importHomeloansMonthlyClickCount': {
    perform: async (done) => {
      try {
        console.log('resque importHomeloansMonthlyClickCount')
        await importHomeloansMonthlyClickCount()
        done()
      } catch (error) {
        done(error.message)
      }
    },
  },
  'importPaymentMonetizationTypes': {
    perform: async (done) => {
      try {
        await importPaymentMonetizationTypes()
        done()
      } catch (error) {
        done(error.message)
      }
    },
  }
}

let scheduler = new Resque.scheduler({connection: connectionDetails})
let queue = new Resque.queue({connection: connectionDetails}, jobs)
let worker = new Resque.worker({connection: connectionDetails, queues: ['ultimate']}, jobs)

scheduler.on('master', (state) => { logger.info('scheduler became master') })

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
  schedule.scheduleJob('45 16 * * *', () => {
    if (scheduler.master) {
      queue.enqueue('ultimate', 'loadPersonalLoansToRedshift')
    }
  })
  schedule.scheduleJob('00 7 * * *', () => {
    if (scheduler.master) {
      queue.enqueue('ultimate', 'importHomeloansMonthlyClickCount')
    }
  })
  schedule.scheduleJob('15 7 * * *', () => {
    if (scheduler.master) {
      queue.enqueue('ultimate', 'importPaymentMonetizationTypes')
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
