var logger = require('../utils/logger')
var importHomeloansMonthlyClickCount = require('../redshift/importHomeloansMonthlyClickCount')

module.exports = {
  perform: async (done) => {
    try {
      logger(new Date() + ' resque importHomeloansMonthlyClickCount')
      await importHomeloansMonthlyClickCount()
      done()
    } catch (error) {
      done(new Date() + ' importHomeloansMonthlyClickCount ' + error.message)
    }
  },
}
