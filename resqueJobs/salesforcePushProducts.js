var logger = require('../utils/logger')
var salesforcePushProducts = require('../services/salesforcePush').pushProducts

const salesforceProducts = {
  perform: async (done) => {
    try {
      logger.info(new Date() + ' resque salesforcePushProducts')
      await salesforcePushProducts()
      done()
    } catch (error) {
      done(new Date() + ' salesforcePushProducts ' + error.message)
    }
  },
}

module.exports = salesforceProducts
