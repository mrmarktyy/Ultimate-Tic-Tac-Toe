var logger = require('../utils/logger')
var importPaymentMonetizationTypes = require('../redshift/importPaymentMonetizationTypes')

const paymentMonetizationTypes = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque importPaymentMonetizationTypes')
      await importPaymentMonetizationTypes()
    } catch (error) {
      return new Date() + ' importPaymentMonetizationTypes ' + error.message
    }
  },
}

module.exports = paymentMonetizationTypes
