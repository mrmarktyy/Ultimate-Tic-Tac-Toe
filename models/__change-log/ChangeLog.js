var keystone = require('keystone')
var Types = keystone.Field.Types

var ChangeLog = new keystone.List('ChangeLog', { nocreate: true, nodelete: true })

ChangeLog.add({
  model: { type: Types.Relationship, ref: 'Company', required: false, hidden: true },
  collectionName: { type: Types.Text, noedit: true },
  modelId: { type: Types.Text, noedit: true },
  attributeName: { type: Types.Text, noedit: true },
  newValue: { type: Types.Text, noedit: true },
  oldValue: { type: Types.Text, noedit: true },
  updatedAt: { type: Types.Datetime, noedit: true },
  updatedBy: { type: Types.Relationship, ref: 'User', noedit: true },
})

ChangeLog.defaultColumns = 'collectionName, modelId, attributeName, newValue, oldValue', 'updatedAt'
ChangeLog.searchFields = 'collectionName, attributeName'
ChangeLog.defaultSort = '-updatedAt'
ChangeLog.register()

