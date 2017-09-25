var logger = require('../utils/logger')
var loadHomeLoanstoRedshift = require('../redshift/homeloans')

const homeLoanstoRedshift = {
  perform: async (done) => {
    try {
      logger.info(new Date() + ' resque loadHomeLoanstoRedshift')
      await loadHomeLoanstoRedshift()
      done()
    } catch (error) {
      done(new Date() + ' loadHomeLoanstoRedshift ' + error.message)
    }
  },
}

module.exports = homeLoanstoRedshift
