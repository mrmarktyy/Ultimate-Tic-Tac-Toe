var logger = require('../utils/logger')
var salesforcePushCompanies = require('../services/salesforcePush').pushCompanies

const salesforceCompanies = {
  perform: async (done) => {
    try {
      logger.info(new Date() + ' resque salesforcePushCompanies')
      await salesforcePushCompanies()
      done()
    } catch (error) {
      done(new Date() + ' salesforcePushCompanies ' + error.message)
    }
  },
}

module.exports = salesforceCompanies
