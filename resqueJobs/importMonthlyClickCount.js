var logger = require('../utils/logger')
var importMonthlyClickCount = require('../redshift/importMonthlyClickCount')

module.exports = {
  perform: async (done) => {
    try {
      logger.info(new Date() + ' resque importMonthlyClickCount')
      await importMonthlyClickCount()
      done()
    } catch (error) {
      done(new Date() + ' importMonthlyClickCount ' + error.message)
    }
  },
}
