var logger = require('../utils/logger')
var loadBankAccountsToRedshift = require('../redshift/bankaccounts')

const bankAccountsToRedshift = {
  perform: async (done) => {
    try {
      logger.info(new Date() + ' resque loadBankAccountsToRedshift')
      await loadBankAccountsToRedshift()
      done()
    } catch (error) {
      console.log('in error')
      done(new Date() + ' loadBankAccountsToRedshift ' + error.message)
    }
  },
}

module.exports = bankAccountsToRedshift
