var logger = require('../utils/logger')
var loadCreditCardsToRedshift = require('../redshift/creditcards')

const creditCardsToRedshift = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque loadCreditCardsToRedshift')
      await loadCreditCardsToRedshift()
    } catch (error) {
      return new Date() + ' loadCreditCardsToRedshift ' + error.message
    }
  },
}

module.exports = creditCardsToRedshift
