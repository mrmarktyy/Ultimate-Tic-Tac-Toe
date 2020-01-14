var keystone = require('keystone')
var _ = require('lodash')

var Redirect = keystone.list('Redirect')

exports.list = async function (req, res) {
  const redirects = await Redirect.model.find().lean().exec()
  res.jsonp(redirects)
}
