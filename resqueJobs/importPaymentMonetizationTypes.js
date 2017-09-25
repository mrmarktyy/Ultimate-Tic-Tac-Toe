var logger = require('../utils/logger')
var importPaymentMonetizationTypes = require('../redshift/importPaymentMonetizationTypes')

const paymentMonetizationTypes = {
  perform: async (done) => {
    try {
      logger(new Date() + ' resque importPaymentMonetizationTypes')
      await importPaymentMonetizationTypes()
      done()
    } catch (error) {
      done(new Date() + ' importPaymentMonetizationTypes ' + error.message)
    }
  },
}

module.exports = paymentMonetizationTypes
