var keystone = require('keystone')
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')
var Types = keystone.Field.Types

var RedrawFacility = new keystone.List('RedrawFacility', {
	track: true,
	map: { name: 'id' },
})

RedrawFacility.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
		noedit: true,
	},
	product: {
		type: Types.Relationship,
		ref: 'HomeLoan',
		required: true,
		initial: true,
		index: true,
		noedit: true,
		filters: { company: ':company' },
	},
	name: { type: Types.Text, initial: true },
	description: { type: Types.Text, initial: true },
	duringPeriod: { type: Types.Select, initial: true, required: true, options: ['VARIABLE', 'FIXED'], emptyOption: false },
	isUnlimitedRedraw: { type: Types.Boolean, indent: true, default: false },
	minRedrawAmount: { type: Types.Number, initial: true },
	maxRedrawAmount: { type: Types.Number, initial: true },
	feeToActivateRedraw: { type: Types.Number, initial: true },
})
RedrawFacility.add(verifiedCommonAttribute)
RedrawFacility.schema.pre('validate', async function (next) {
	if (this.minRedrawAmount > this.maxRedrawAmount) {
		next(Error('Max Redraw Amount can not less than Min Redraw Amount'))
	}
	await changeLogService(this)
	next()
})

RedrawFacility.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

RedrawFacility.defaultColumns = 'name, product, company, duringPeriod, isUnlimitedRedraw'
RedrawFacility.register()

