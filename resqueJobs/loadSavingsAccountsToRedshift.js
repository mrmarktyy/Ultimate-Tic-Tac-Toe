var logger = require('../utils/logger')
var loadSavingsAccountsToRedshift = require('../redshift/savingsaccounts')

const savingsAccountsToRedshift = {
  perform: async (done) => {
    try {
      console.log('before date')
      logger.info(new Date() + ' resque loadSavingsAccountsToRedshift')
      console.log('got here')
      await loadSavingsAccountsToRedshift()
      done()
    } catch (error) {
      console.log('in error')
      done(new Date() + ' loadSavingsAccountsToRedshift ' + error.message)
    }
  },
}

module.exports = savingsAccountsToRedshift
