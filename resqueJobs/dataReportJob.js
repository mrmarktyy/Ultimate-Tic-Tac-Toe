var logger = require('../utils/logger')
var dataReport = require('../services/reporting/dataReport')

const emailDataReport = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque dataReport')
      await dataReport()
    } catch (error) {
      return new Date() + ' dataReport ' + error.message
    }
  },
}

module.exports = emailDataReport
