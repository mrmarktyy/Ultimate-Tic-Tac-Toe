var logger = require('../utils/logger')
var copyHasoffersConversionsToNewRedshift = require('../redshift/copyHasoffersConversionsToNewRedshift')

const oldHasoffersConversionsToNewRedshift = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque oldHasoffersConversionsToNewRedshift')
      await copyHasoffersConversionsToNewRedshift()
    } catch (error) {
      return new Date() + ' oldHasoffersConversionsToNewRedshift ' + error.message
    }
  },
}

module.exports = oldHasoffersConversionsToNewRedshift
