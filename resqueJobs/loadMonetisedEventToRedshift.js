var logger = require('../utils/logger')
var monetisedEvents = require('../redshift/monetisedEvents')

const monetisedEventsToRedshift = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque dataReport')
      await monetisedEvents()
    } catch (error) {
      return new Date() + ' monetisedEvents ' + error.message
    }
  },
}

module.exports = monetisedEventsToRedshift
