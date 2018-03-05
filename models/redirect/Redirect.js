var keystone = require('keystone')
var Types = keystone.Field.Types

var Redirect = new keystone.List('Redirect', {
    track: true,
})

Redirect.add({
  from: { type: Types.Text, required: true, initial: true, unique: true },
  to: { type: Types.Text, required: true, initial: true },
  status: {
    type: Types.Select,
    options: [{value: '301', label: '301 - Permanent'}, {value: '302', label: '302 - Temporary'}],
    required: true,
    initial: true,
  },
  startDate: { type: Types.Datetime },
  notes: { type: Types.Text },
})

Redirect.defaultColumns = 'from, to, status'
Redirect.register()

