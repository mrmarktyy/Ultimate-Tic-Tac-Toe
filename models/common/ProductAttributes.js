const keystone = require('keystone')
const Types = keystone.Field.Types

module.exports = {
  name: { type: Types.Text, required: true, initial: true, index: true },
  uuid: { type: Types.Text, initial: true, index: true, unique: true },
  slug: { type: Types.Text, index: true, initial: true },
  otherNames: { type: Types.TextArray },
  displayName: { type: Types.Text, initial: true },
  isMonetized: { type: Types.Boolean, indent: true, noedit: true, default: false },
  isDiscontinued: { type: Types.Boolean, indent: true, default: false },
}
