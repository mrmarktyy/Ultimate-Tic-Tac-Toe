var keystone = require('keystone')
var uuid = require('node-uuid')
var Types = keystone.Field.Types
var genericVerticals = require('../helpers/genericVerticals')
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

const verticals = Object.keys(genericVerticals).map((key) => ({ value: genericVerticals[key].slug, label: key }))

var GenericProduct = new keystone.List('GenericProduct', {
	track: true,
})

GenericProduct.add({
	uuid: {type: Types.Text, initial: true, noedit: true, unique: true},
	vertical: {type: Types.Select, required: true, options: verticals, initial: true},
	name: {type: Types.Text, required: true, initial: true},
	subTitle: {type: Types.Text},
	description: {type: Types.Text, initial: true},
	features: {type: Types.TextArray},
	company: {type: Types.Relationship, ref: 'Company', required: true, many: false, initial: true},
	url: {type: Types.Text, initial: true},
	promotedOrder: { type: Types.Select, options: [{ value: '0', label: 'None' }, { value: '1', label: '1 - First' }, 2, 3, 4, 5, 6, 7, 8, 9, 10], default: '0' },
})

GenericProduct.add(verifiedCommonAttribute)
GenericProduct.schema.pre('validate', async function (next) {
	if(this.features && this.features.length > 6) {
		next(Error('Can add only upto 6 features for every product'))
	}
	next()
})

GenericProduct.schema.pre('save', async function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}
	await changeLogService(this)
	next()
})

GenericProduct.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

GenericProduct.defaultColumns = 'uuid, vertical, name, description, url'
GenericProduct.register()

