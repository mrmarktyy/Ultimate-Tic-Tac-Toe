var keystone = require('keystone')
var uuid = require('node-uuid')
var verticals = require('../helpers/verticals')
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')
var Types = keystone.Field.Types
var blazePages = require('../../data/blazePages')
var shareOfVoiceAttributes = require('../common/ShareOfVoiceCommonAttributes')

var PromotedProduct = new keystone.List('PromotedProduct', {
    track: true,
})
var MonetizeProduct = new keystone.List('Monetize')

PromotedProduct.add({
	uuid: {type: Types.Text, initial: true},
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
		noedit: true,
	},
	vertical: {type: Types.Select, required: true, options: verticals, initial: true},
	title: {type: Types.Text, initial: true, index: true},
	order: {type: Types.Number, default: 1, initial: true},
	dateStart: {type: Types.Datetime, required: true, initial: true},
	dateEnd: {type: Types.Datetime, initial: true},
	pages: {type: Types.MultiSelect, options: [], initial: true},
	enabled: {type: Types.Boolean, indent: true, required: true, default: true, initial: true},
})

PromotedProduct.add(shareOfVoiceAttributes)
PromotedProduct.add(verifiedCommonAttribute)
PromotedProduct.fields.pages.ops = blazePages

PromotedProduct.schema.pre('validate', function (next) {
	if ((this.dateEnd !== null) && (this.dateEnd < this.dateStart)) {
		next(Error('End date has to be greater than start date'))
	}
	next()
})

PromotedProduct.schema.index({uuid: 1, vertical: 1, dateStart: 1}, {unique: true})

PromotedProduct.schema.pre('save', async function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}
  await changeLogService(this)
  next()
})

PromotedProduct.schema.post('save', async function () {
	await verifiedService(this)
})

PromotedProduct.defaultColumns = 'uuid, vertical, title, order, dateStart, dateEnd, company'
PromotedProduct.defaultSort = '-dateStart, vertical, order'
PromotedProduct.register()
