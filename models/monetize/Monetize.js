var keystone = require('keystone')
var Types = keystone.Field.Types

var Monetize = new keystone.List('Monetize', {
    track: true,
    nocreate: true,
    nodelete: true,
})

Monetize.add({
  uuid: { type: Types.Text, noedit: true },
  vertical: { type: Types.Text, noedit: true },
  applyUrl: { type: Types.Text, noedit: true },
  enabled: { type: Types.Boolean, indent: true, noedit: true },
  product: {
    type: Types.Relationship,
    ref: 'PersonalLoan',
    required: false,
    noedit: true,
    hidden: true,
  },
})

Monetize.defaultColumns = 'uuid, vertical, enabled, applyUrl'
Monetize.defaultSort = '-enabled, vertical, uuid'
Monetize.schema.index({ uuid: 1 }, { unique: true })
Monetize.register()
