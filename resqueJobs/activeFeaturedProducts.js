var logger = require('../utils/logger')
var activeFeaturedProducts = require('../ingestor/activeFeaturedProducts')

const activeFeaturedProductsJob = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque activeFeaturedProducts')
      await activeFeaturedProducts()
    } catch (error) {
      return new Date() + ' activeFeaturedProducts ' + error.message
    }
  },
}

module.exports = activeFeaturedProductsJob
