const keystone = require('keystone')
const Types = keystone.Field.Types

const BureauAttribute = new keystone.List('BureauAttribute', {
  track: true,
})

BureauAttribute.add ({
  name: { type: Types.Text, initial: true },
  code: { type: Types.Text, initial: true },
  dataType: { type: Types.Select, options: 'Number, Text', default: 'Number', initial: true },
})

BureauAttribute.defaultSort = 'name, code, dataType'
BureauAttribute.defaultColumns = 'name, code, dataType'
BureauAttribute.register()
