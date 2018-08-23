var logger = require('../utils/logger')
var pages = require('../ingestor/pages.js')

const ingestPages = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      logger.info(new Date() + ' resque ingestPages')
      await pages()
    } catch (error) {
      return new Date() + ' ingestPages ' + error.message
    }
  },
}

module.exports = ingestPages
