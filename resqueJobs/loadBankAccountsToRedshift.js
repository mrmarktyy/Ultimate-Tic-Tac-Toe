var logger = require('../utils/logger')
var loadBankAccountsToRedshift = require('../redshift/bankaccounts')

const bankAccountsToRedshift = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque loadBankAccountsToRedshift')
      await loadBankAccountsToRedshift()
    } catch (error) {
      return new Date() + ' loadBankAccountsToRedshift ' + error.message
    }
  },
}

module.exports = bankAccountsToRedshift
