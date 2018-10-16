var logger = require('../utils/logger')
var copyOldApplyClicksToNewRedshift = require('../redshift/copyOldApplyClicksToNewRedshift')

const oldApplyClicksToNewRedshiftJob = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque oldApplyClicksToNewRedshift')
      await copyOldApplyClicksToNewRedshift()
    } catch (error) {
      return new Date() + ' oldApplyClicksToNewRedshift ' + error.message
    }
  },
}

module.exports = oldApplyClicksToNewRedshiftJob
