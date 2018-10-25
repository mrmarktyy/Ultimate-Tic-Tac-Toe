var logger = require('../utils/logger')
var copyRcLeadsToNewRedshift = require('../redshift/copyRcleadsToNewRedshift')

const copyRcLeadsToNewRedshiftJob = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque copyRcLeadsToNewRedshiftJob')
      await copyRcLeadsToNewRedshift()
    } catch (error) {
      return new Date() + ' copyRcLeadsToNewRedshiftJob ' + error.message
    }
  },
}

module.exports = copyRcLeadsToNewRedshiftJob
