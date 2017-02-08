var keystone = require('keystone')
var mongoose = require('mongoose')
var _ = require('lodash')
var logger = require('../utils/logger')

var ChangeLog = keystone.list('ChangeLog')

module.exports = function (currentRecord, options = {}) {
  let collectionName = currentRecord.constructor.modelName
  let Model = mongoose.model(collectionName)
  let dontLogKeys = options['dontLogKeys'] || []
  dontLogKeys = _.union(dontLogKeys, ['updatedAt', 'updatedBy', 'createdAt', 'createdBy'])
  let user = options['user']

  Model.findOne({ _id: currentRecord._id }).lean().exec((err, oldRecord) => {
    if (oldRecord !== null) {
      let keysToLog = loggedDocumentKeys(currentRecord.list.fields, dontLogKeys)

      for (let key of keysToLog) {
        if (!_.isEqual(currentRecord[key], oldRecord[key])) {
          let newValue = currentRecord[key] == undefined ? null : currentRecord[key]
          let oldValue = oldRecord[key] == undefined ? null : oldRecord[key]

          let changeLog = new ChangeLog.model({
            collectionName: collectionName,
            modelId: oldRecord._id,
            attributeName: key,
            newValue: newValue,
            oldValue: oldValue,
            updatedAt: currentRecord.updatedAt,
            updatedBy: currentRecord.updatedBy,
          })
          changeLog.save((err) => {
            if (err) {
              logger.error('database error on adding a diff to the changeLog')
              return 'database error'
            }
          })
        }
      }
    }
  })
}

function loggedDocumentKeys (record, removeKeys = []) {
  let keys = []
  for (let key in record) {
    keys.push(key)
  }

  for (let i = 0; i < removeKeys.length; i++) {
    let keyIndex = keys.indexOf(removeKeys[i])
    keys.splice(keyIndex, 1)
  }
  return keys
}
