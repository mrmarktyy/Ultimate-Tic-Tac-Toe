var logger = require('../utils/logger')
var loadTermDepositsToRedshift = require('../redshift/termdeposits')

const termDepositsToRedshift = {
  perform: async (done) => {
    try {
      logger.info(new Date() + ' resque loadTermDepositsToRedshift')
      await loadTermDepositsToRedshift()
      done()
    } catch (error) {
      console.log('in error')
      done(new Date() + ' loadTermDepositsToRedshift ' + error.message)
    }
  },
}

module.exports = termDepositsToRedshift
