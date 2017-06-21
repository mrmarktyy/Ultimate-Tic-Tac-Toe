var _ = require('lodash')

module.exports = function (obj, fields = []) {
  return _.omit(obj, fields.concat('createdAt', 'createdBy', 'updatedBy', 'updatedAt', '__v', '_id'))
}
