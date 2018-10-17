var logger = require('../utils/logger')
var copyConversionsNewToNewRedshift = require('../redshift/copyConversionsNewToNewRedshift')

const oldConversionsNewToNewRedshiftJob = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque oldConversionsNewToNewRedshiftJob')
      await copyConversionsNewToNewRedshift()
    } catch (error) {
      return new Date() + ' oldConversionsNewToNewRedshiftJob ' + error.message
    }
  },
}

module.exports = oldConversionsNewToNewRedshiftJob
