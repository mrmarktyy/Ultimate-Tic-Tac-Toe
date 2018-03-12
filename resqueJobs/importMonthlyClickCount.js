var logger = require('../utils/logger')
var importMonthlyClickCount = require('../redshift/importMonthlyClickCount')

module.exports = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque importMonthlyClickCount')
      await importMonthlyClickCount()
    } catch (error) {
      return new Date() + ' importMonthlyClickCount ' + error.message
    }
  },
}
