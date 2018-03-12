var logger = require('../utils/logger')
var salesforcePushProducts = require('../services/salesforcePush').pushProducts

const salesforceProducts = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque salesforcePushProducts')
      await salesforcePushProducts()
    } catch (error) {
      return new Date() + ' salesforcePushProducts ' + error.message
    }
  },
}

module.exports = salesforceProducts
