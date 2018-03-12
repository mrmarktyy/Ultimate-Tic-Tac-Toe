var logger = require('../utils/logger')
var loadSavingsAccountsToRedshift = require('../redshift/savingsaccounts')

const savingsAccountsToRedshift = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque loadSavingsAccountsToRedshift')
      await loadSavingsAccountsToRedshift()
    } catch (error) {
      return new Date() + ' loadSavingsAccountsToRedshift ' + error.message
    }
  },
}

module.exports = savingsAccountsToRedshift
