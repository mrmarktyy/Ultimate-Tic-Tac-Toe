var logger = require('../utils/logger')
var loadPersonalLoansToRedshift = require('../redshift/personalloans')

const personalLoansToRedshift = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque loadPersonalLoansToRedshift')
      await loadPersonalLoansToRedshift()
    } catch (error) {
      return new Date() + ' loadPersonalLoansToRedshift ' + error.message
    }
  },
}

module.exports = personalLoansToRedshift
