var keystone = require('keystone')
var Types = keystone.Field.Types

var ChangeLog = new keystone.List('ChangeLog')

ChangeLog.add({
  collectionName: { type: Types.Text },
  modelId: { type: Types.Text },
  attributeName: { type: Types.Text },
  newValue: { type: Types.Text },
  oldValue: { type: Types.Text },
  updatedAt: { type: Types.Datetime },
  updatedBy: { type: Types.Text },
})

ChangeLog.defaultColumns = 'collectionName, modelId, attributeName, newValue, oldValue'
ChangeLog.searchFields = 'collectionName, attributeName'
ChangeLog.register()
