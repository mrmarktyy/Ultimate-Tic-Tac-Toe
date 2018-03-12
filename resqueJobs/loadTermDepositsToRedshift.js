var logger = require('../utils/logger')
var loadTermDepositsToRedshift = require('../redshift/termdeposits')

const termDepositsToRedshift = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque loadTermDepositsToRedshift')
      await loadTermDepositsToRedshift()
    } catch (error) {
      return new Date() + ' loadTermDepositsToRedshift ' + error.message
    }
  },
}

module.exports = termDepositsToRedshift
