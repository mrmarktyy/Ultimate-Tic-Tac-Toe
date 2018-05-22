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
  },
})

Knockout.relationship({ path: 'BureauExpressions', ref: 'BureauExpression', refPath: 'knockouts', many: true })
Knockout.defaultColumns = 'name, code, dataType'
Knockout.register()
