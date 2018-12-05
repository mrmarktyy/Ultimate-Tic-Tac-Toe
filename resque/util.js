require('dotenv').config()

var Resque = require('node-resque')
var logger = require('../utils/logger')

var monthlyClickCount = require('../resqueJobs/importMonthlyClickCount')
var paymentMonetizationTypes = require('../resqueJobs/importPaymentMonetizationTypes')
var homeLoansToRedshift = require('../resqueJobs/loadHomeLoansToRedshift')
var personalLoansToRedshift = require('../resqueJobs/loadPersonalLoansToRedshift')
var copyConversionsNewToNewRedshiftJob = require('../resqueJobs/copyConversionsNewToNewRedshiftJob')
var copyHasoffersConversionsToNewRedshiftJob = require('../resqueJobs/copyHasoffersConversionsToNewRedshiftJob')
var copyMarketplaceApplyClicksToNewRedshiftJob = require('../resqueJobs/copyMarketplaceApplyClicksToNewRedshiftJob')
var copyOldApplyClicksToNewRedshiftJob = require('../resqueJobs/copyOldApplyClicksToNewRedshiftJob')
var copyRcLeadsToNewRedshiftJob = require('../resqueJobs/copyRcLeadsToNewRedshiftJob')
var creditCardsToRedshift = require('../resqueJobs/loadCreditCardsToRedshift')
var emailMonthlyClicks = require('../resqueJobs/monthlyClicks')
var emailDataReport = require('../resqueJobs/dataReportJob')
var salesforceProducts = require('../resqueJobs/salesforcePushProducts')
var salesforceCompanies = require('../resqueJobs/salesforcePushCompanies')
var savingsAccountsToRedshift = require('../resqueJobs/loadSavingsAccountsToRedshift')
var bankAccountsToRedshift = require('../resqueJobs/loadBankAccountsToRedshift')
var termDepositsToRedshift = require('../resqueJobs/loadTermDepositsToRedshift')
var monetisedEventsToRedshift = require('../resqueJobs/loadMonetisedEventToRedshift')
var ingestLongtailux = require('../resqueJobs/ingestLongtailux')
var ingestPages = require('../resqueJobs/ingestPages')

var blazePages = require('../resqueJobs/blazePages')

const connectionDetails = {
  pkg: 'ioredis',
  host: process.env.REDIS_HOST,
  port: 6379,
  database: 5,
}

const jobs = {
  'bankAccountsToRedshift': bankAccountsToRedshift,
  'blazePages': blazePages,
  'copyConversionsNewToNewRedshiftJob': copyConversionsNewToNewRedshiftJob,
  'copyHasoffersConversionsToNewRedshiftJob': copyHasoffersConversionsToNewRedshiftJob,
  'copyMarketplaceApplyClicksToNewRedshiftJob': copyMarketplaceApplyClicksToNewRedshiftJob,
  'copyOldApplyClicksToNewRedshiftJob': copyOldApplyClicksToNewRedshiftJob,
  'copyRcLeadsToNewRedshiftJob': copyRcLeadsToNewRedshiftJob,
  'creditCardsToRedshift': creditCardsToRedshift,
  'emailMonthlyClicks': emailMonthlyClicks,
  'emailDataReport': emailDataReport,
  'homeLoansToRedshift': homeLoansToRedshift,
  'ingestPages': ingestPages,
  'ingestLongtailux': ingestLongtailux,
  'monthlyClickCount': monthlyClickCount,
  'monetisedEventsToRedshift': monetisedEventsToRedshift,
  'paymentMonetizationTypes': paymentMonetizationTypes,
  'personalLoansToRedshift': personalLoansToRedshift,
  'salesforceProducts': salesforceProducts,
  'salesforceCompanies': salesforceCompanies,
  'savingsAccountsToRedshift': savingsAccountsToRedshift,
  'termDepositsToRedshift': termDepositsToRedshift,
}

let scheduler = new Resque.Scheduler({connection: connectionDetails})
let queue = new Resque.Queue({connection: connectionDetails}, jobs)
let worker = new Resque.Worker({connection: connectionDetails, queues: ['ultimate']}, jobs)

worker.on('start', () => { logger.info('worker started') })
worker.on('end', () => { logger.info('worker ended') })
worker.on('cleaning_worker', (worker, pid) => { logger.info('cleaning old worker ' + worker) })
worker.on('job', (queue, job) => { logger.info('working job ' + queue + ' ' + JSON.stringify(job)) })
worker.on('reEnqueue', (queue, job, plugin) => { logger.info('reEnqueue job (' + plugin + ') ' + queue + ' ' + JSON.stringify(job)) })
worker.on('success', (queue, job, result) => { logger.info('job success ' + queue + ' ' + JSON.stringify(job) + ' >> ' + result) })
worker.on('failure', (queue, job, failure) => { logger.info('job failure ' + queue + ' ' + JSON.stringify(job) + ' >> ' + failure) })
worker.on('error', (queue, job, error) => { logger.info('error ' + queue + ' ' + JSON.stringify(job) + ' >> ' + error) })

scheduler.on('start', () => { logger.info('scheduler started') })
scheduler.on('end', () => { logger.info('scheduler ended') })
scheduler.on('master', (state) => { logger.info('scheduler became master') })
scheduler.on('error', (error) => { logger.info('scheduler error >> ' + error) })
scheduler.on('working_timestamp', (timestamp) => { logger.info('scheduler working timestamp ' + timestamp) })
scheduler.on('transferred_job', (timestamp, job) => { logger.info('scheduler enquing job ' + timestamp + ' >> ' + JSON.stringify(job)) })

module.exports = {
  scheduler,
  queue,
  worker,
}
