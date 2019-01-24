var logger = require('../utils/logger')
var loadSpecialsToRedshift = require('../redshift/specials')

const specialsToRedshift = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque loadSpecialsToRedshift')
      await loadSpecialsToRedshift()
    } catch (error) {
      return new Date() + ' loadSpecialsToRedshift ' + error.message
    }
  },
}

module.exports = specialsToRedshift
