var logger = require('../utils/logger')
var longTailUx = require('../ingestor/longTailUx.js')

const ingestLongtailux = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque ingestLongtailux')
      await longTailUx()
    } catch (error) {
      return new Date() + ' ingestLongtailux ' + error.message
    }
  },
}

module.exports = ingestLongtailux
