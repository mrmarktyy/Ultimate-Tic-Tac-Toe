var _ = require('lodash')

module.exports = function (obj, fields) {
  return _.omit(obj, fields)
}
