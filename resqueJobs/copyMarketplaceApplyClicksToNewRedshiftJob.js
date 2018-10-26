var logger = require('../utils/logger')
var copyMarketplaceApplyClicksToNewRedshift = require('../redshift/copyMarketplaceApplyClicksToNewRedshift')

const copyMarketplaceApplyClicksToNewRedshiftJob = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque copyMarketplaceApplyClicksToNewRedshiftJob')
      await copyMarketplaceApplyClicksToNewRedshift()
    } catch (error) {
      return new Date() + ' copyMarketplaceApplyClicksToNewRedshiftJob ' + error.message
    }
  },
}

module.exports = copyMarketplaceApplyClicksToNewRedshiftJob
