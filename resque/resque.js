require('dotenv').config()

const Resque = require('node-resque')
const schedule = require('node-schedule')
const logger = require('../utils/logger')

var importHomeloansMonthlyClickCount = require('../redshift/importHomeloansMonthlyClickCount')
var importPaymentMonetizationTypes = require('../redshift/importPaymentMonetizationTypes')
var loadPersonalLoansToRedshift = require('../redshift/personalloans')
var loadHomeLoanstoRedshift = require('../redshift/homeloans')
var salesforcePushCompanies = require('../services/salesforcePush').pushCompanies
var salesforcePushProducts = require('../services/salesforcePush').pushProducts

const connectionDetails = {
  pkg: 'ioredis',
  host: process.env.REDIS_HOST,
  port: 6379,
  database: 5,
}

const jobs = {
  'loadHomeLoanstoRedshift': {
    perform: async (done) => {
      try {
        console.log(new Date() + ' resque loadHomeLoanstoRedshift')
        await loadHomeLoanstoRedshift()
        done()
      } catch (error) {
        done(new Date() + ' loadHomeLoanstoRedshift ' + error.message)
      }
    },
  },
  'loadPersonalLoansToRedshift': {
    perform: async (done) => {
      try {
        console.log(new Date() + ' resque loadPersonalLoansToRedshift')
        await loadPersonalLoansToRedshift()
        done()
      } catch (error) {
        done(new Date() + ' loadPersonalLoansToRedshift ' + error.message)
      }
    },
  },
  'importHomeloansMonthlyClickCount': {
    perform: async (done) => {
      try {
        console.log(new Date() + ' resque importHomeloansMonthlyClickCount')
        await importHomeloansMonthlyClickCount()
        done()
      } catch (error) {
        done(new Date() + ' importHomeloansMonthlyClickCount ' + error.message)
      }
    },
  },
  'importPaymentMonetizationTypes': {
    perform: async (done) => {
      try {
        console.log(new Date() + ' resque importPaymentMonetizationTypes')
        await importPaymentMonetizationTypes()
        done()
      } catch (error) {
        done(new Date() + ' importPaymentMonetizationTypes ' + error.message)
      }
    },
  },
  'salesforcePushCompanies': {
    perform: async (done) => {
      try {
        console.log(new Date() + ' resque salesforcePushCompanies')
        await salesforcePushCompanies()
        done()
      } catch (error) {
        done(new Date() + ' salesforcePushCompanies ' + error.message)
      }
    },
  },
  'salesforcePushProducts': {
    perform: async (done) => {
      try {
        console.log(new Date() + ' resque salesforcePushProducts')
        await salesforcePushProducts()
        done()
      } catch (error) {
        done(new Date() + ' salesforcePushProducts ' + error.message)
      }
    },
  },
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
  schedule.scheduleJob('45 21 * * *', () => {
   if (scheduler.master) {
      queue.enqueue('ultimate', 'loadHomeLoanstoRedshift')
    }
  })
  schedule.scheduleJob('25 * * * *', () => {
    if (scheduler.master) {
      queue.enqueue('ultimate', 'salesforcePushCompanies')
    }
  })
  schedule.scheduleJob('28 * * * *', () => {
    if (scheduler.master) {
      queue.enqueue('ultimate', 'salesforcePushProducts')
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
