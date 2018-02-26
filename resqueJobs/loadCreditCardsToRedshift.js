var logger = require('../utils/logger')
var loadCreditCardsToRedshift = require('../redshift/creditcards')

const creditCardsToRedshift = {
  perform: async (done) => {
    try {
      logger.info(new Date() + ' resque loadCreditCardsToRedshift')
      await loadCreditCardsToRedshift()
      done()
    } catch (error) {
      done(new Date() + ' loadCreditCardsToRedshift ' + error.message)
    }
  },
}

module.exports = creditCardsToRedshift
