var logger = require('../utils/logger')
var loadPersonalLoansToRedshift = require('../redshift/personalloans')

const personalLoansToRedshift = {
  perform: async (done) => {
    try {
      logger.info(new Date() + ' resque loadPersonalLoansToRedshift')
      await loadPersonalLoansToRedshift()
      done()
    } catch (error) {
      done(new Date() + ' loadPersonalLoansToRedshift ' + error.message)
    }
  },
}

module.exports = personalLoansToRedshift
