var keystone = require('keystone')
var Types = keystone.Field.Types

module.exports = {
	name: { type: Types.Text, required: true, initial: true, index: true },
	uuid: { type: Types.Text, initial: true }, // this should be unique, however, team don't have the data yet. will make this unique once all data loaded.
	slug: { type: Types.Text, index: true },
	otherNames: { type: Types.TextArray },
	displayName: { type: Types.Text, required: true, initial: true },
	isDiscontinued: { type: Types.Boolean, indent: true, default: false },
	promotedOrder: { type: Types.Select, options: [{ value: '0', label: 'None' }, { value: '1', label: '1 - First' }, 2, 3, 4, 5, 6, 7, 8, 9, 10], default: '0' },
}
