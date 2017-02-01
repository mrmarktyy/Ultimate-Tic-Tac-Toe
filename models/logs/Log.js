var keystone = require('keystone')
var Types = keystone.Field.Types

var Log = new keystone.List('Log')

Log.add({
  event: { type: Types.Text, required: true, initial: true, index: true },
  message: { type: Types.Textarea, height: 1000, required: true, initial: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
})

Log.defaultSort = '-createdAt'
Log.defaultColumns = 'event, message, createdAt'
Log.searchFields = 'event, message, createdAt'
Log.register()
