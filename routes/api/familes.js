var keystone = require('keystone')
var HomeLoanFamily = keystone.list('HomeLoanFamily')

exports.list = async function (req, res) {
  let families = await HomeLoanFamily.model.find({}, {_id: 0}).lean().exec()
  res.jsonp(families)
}
