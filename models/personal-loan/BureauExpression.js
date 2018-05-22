const keystone = require('keystone')
const Types = keystone.Field.Types

const BureauExpression = new keystone.List('BureauExpression', {
  track: true,
})

BureauExpression.add ({
  name: { type: Types.Text, initial: true, required: true },
  bureauAttribute: {
    type: Types.Relationship,
    ref: 'BureauAttribute',
    required: true,
    initial: true,
    index: false,
  },
  operator: { type: Types.Select, options: '=,>,<,<=,>=', default: '=', initial: true },
  value: { type: Types.Text, initial: true },
})

BureauExpression.defaultColumns = 'name, knockout, BureauAttribute, operator, value'
BureauExpression.register()
