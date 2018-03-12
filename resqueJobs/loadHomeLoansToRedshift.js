var logger = require('../utils/logger')
var loadHomeLoanstoRedshift = require('../redshift/homeloans')

const homeLoanstoRedshift = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque loadHomeLoanstoRedshift')
      await loadHomeLoanstoRedshift()
    } catch (error) {
      return new Date() + ' loadHomeLoanstoRedshift ' + error.message
    }
  },
}

module.exports = homeLoanstoRedshift
