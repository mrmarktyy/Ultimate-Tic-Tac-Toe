var logger = require('../utils/logger')
var loadSavingsAccountsToRedshift = require('../redshift/savingsaccounts')

const savingsAccountsToRedshift = {
  perform: async (done) => {
    try {
      logger.info(new Date() + ' resque loadSavingsAccountsToRedshift')
      await loadSavingsAccountsToRedshift()
      done()
    } catch (error) {
      console.log('in error')
      done(new Date() + ' loadSavingsAccountsToRedshift ' + error.message)
    }
  },
}

module.exports = savingsAccountsToRedshift
