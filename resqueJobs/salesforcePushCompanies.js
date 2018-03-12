var logger = require('../utils/logger')
var salesforcePushCompanies = require('../services/salesforcePush').pushCompanies

const salesforceCompanies = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque salesforcePushCompanies')
      await salesforcePushCompanies()
    } catch (error) {
      return new Date() + ' salesforcePushCompanies ' + error.message
    }
  },
}

module.exports = salesforceCompanies
