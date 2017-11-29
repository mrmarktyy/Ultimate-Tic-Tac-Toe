const keystone = require('keystone')
const Types = keystone.Field.Types

module.exports = {
	verifiedAt: { type: Types.Datetime, noedit: true },
	verifiedBy: { type: Types.Relationship, ref: 'User', noedit: true },
	verified: {type: Types.Boolean, indent: true, initial: false},
}
