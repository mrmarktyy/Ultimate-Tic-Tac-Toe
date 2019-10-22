require('dotenv').config()

var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var logger = require('../utils/logger')

var FeaturedProducts = keystoneShell.list('FeaturedProduct')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    const datenow = new Date()
    await FeaturedProducts.model.update({dateEnd: {$lt: datenow}}, {enabled: false}, {multi: true})
    connection.close()
    return 0
  } catch (error) {
    logger.error(error)
    connection.close()
    return error
  }
}
