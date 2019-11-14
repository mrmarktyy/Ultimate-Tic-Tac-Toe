var logger = require('../utils/logger')
var activePromotedProducts = require('../ingestor/activePromotedProducts')

const activePromotedProductsJob = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque activePromotedProducts')
      await activePromotedProducts()
    } catch (error) {
      return new Date() + ' activePromotedProducts ' + error.message
    }
  },
}

module.exports = activePromotedProductsJob
