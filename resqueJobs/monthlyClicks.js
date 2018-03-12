var logger = require('../utils/logger')
var monthlyClicks = require('../redshift/financeMonthEnd').monthlyClicksMail
var moment = require('moment')

const emailMonthlyClicks = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque monthlyClicks')
      let dt = moment().subtract(1, 'months')
      await monthlyClicks({month: dt.format('MMM'), year: dt.format('YYYY')})
    } catch (error) {
      return new Date() + ' monthlyClicks ' + error.message
    }
  },
}

module.exports = emailMonthlyClicks
