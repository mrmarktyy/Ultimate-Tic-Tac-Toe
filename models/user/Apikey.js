var keystone = require('keystone')
var randomstring = require('randomstring')
var Types = keystone.Field.Types

var ApiKey = new keystone.List('ApiKey')

ApiKey.add({
  apiClient: {type: Types.Text, initial: true, required: true, index: true, unique: true},
  apiKey: {type: Types.Text, noedit: true},
})

ApiKey.schema.pre('save', function (next) {
  if (!this.apiKey) {
    this.apiKey = randomstring.generate({
      length: 16,
      capitalization: 'lowercase',
    })
  }
  next()
})

ApiKey.track = true
ApiKey.defaultSort = 'apiClient'
ApiKey.defaultColumns = 'apiClient, apiKey'
ApiKey.searchFields = 'apiClient, apiKey'
ApiKey.register()
