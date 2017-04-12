const keystone = require('keystone')
const Types = keystone.Field.Types

module.exports = {
  description: {type: Types.Text, required: true, index: true, initial: true},
  value: {type: Types.Text, required: true, index: true, initial: true},
}
