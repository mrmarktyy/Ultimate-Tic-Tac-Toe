const keystone = require('keystone')
const Types = keystone.Field.Types

const Knockout = new keystone.List('Knockout', {
  track: true,
})

Knockout.add ({
  name: { type: Types.Text, initial: true, required: true },
  qualifications: {
    type: Types.Relationship,
    ref: 'BureauExpression',
    required: true,
    initial: true,
    index: true,
    many: true,
    label: 'BureauExpressions',
  },
})

Knockout.defaultColumns = 'name, qualifications'
Knockout.register()
