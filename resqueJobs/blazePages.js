var logger = require('../utils/logger')
var client = require('../utils/elasticsearch')
var jsonfile = require('jsonfile')

const blazePages = {
  plugins: ['QueueLock'],
  perform: async () => {
    try {
      const result = await client.search({
        index: 'blaze-pages',
        body: {
          size: 10000,
        },
      })

      let pagesData = result.hits.hits.map((hit) => {
        let item = {}
        if (!['Articles', 'News', 'Guide'].includes(hit._source.page.variant)) {
          item.value = hit._source.url
          item.label = hit._source.url
        } else {
          return null
        }

        return item
      }).filter((hit) => hit !== null)

      pagesData = [
        ...pagesData,
        { value: '/home-loans/chance-to-win-million-dollars', label: '/home-loans/chance-to-win-million-dollars' },
        { value: '/home-loans/it-pays-to-check', label: '/home-loans/it-pays-to-check' },
        { value: '/home-loans/boq/residential-3yr-fixed-3-yrs-250k.basic', label: '/home-loans/boq/residential-3yr-fixed-3-yrs-250k.basic' },
      ]

      pagesData.sort((a, b) => (a.value > b.value) - (a.value < b.value))

      jsonfile.writeFileSync('data/blazePages.json', pagesData)
    } catch (error) {
      logger.error('blazePages ' + error)
      return error.message
    }
  },
}

module.exports = blazePages
