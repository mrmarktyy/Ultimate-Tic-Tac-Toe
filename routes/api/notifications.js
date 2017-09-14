var keystone = require('keystone')

var Notifications = keystone.list('Notifications')
var logger = require('../../utils/logger')

exports.list = function (req, res) {
  let datenow = new Date()
  Notifications.model.find(
    { dateEnd: { $gt: datenow } }
  )
  .exec()
  .then((notifications) => {
    res.jsonp(notifications)
  }).catch((e) => {
    logger.error(e)
    res.jsonp({ error: e })
  })
}
