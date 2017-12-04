var keystone = require('keystone')
var uuid = require('node-uuid')
var Types = keystone.Field.Types
var verticals = require('../helpers/verticals')
var {imageStorage} = require('../helpers/fileStorage')
var shareOfVoiceAttributes = require('../common/ShareOfVoiceCommonAttributes')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

var Broker = new keystone.List('Broker', {track: true}).add({
	uuid: {type: Types.Text, initial: true, noedit: true, unique: true},
	name: {type: Types.Text, initial: true, unique: true},
	slug: {type: Types.Text, initial: true, require: true, unique: true},
	displayName: {type: Types.Text, required: true, initial: true},
	acl: {type: Types.Text},
	abn: {type: Types.Text},
	cid: {type: Types.Text},
	about: {type: Types.Code, height: 250, language: 'html'},
	disclaimer: {type: Types.Code, height: 250, language: 'html'},
	email: {type: Types.TextArray},
	logo: imageStorage('Broker'),
	imageHeader: imageStorage('brokerHeader'),
	phone: {type: Types.Text},
	default: {type: Types.Boolean, initial: true, require: true},
	pros: {type: Types.TextArray},
	lender: {type: Types.Boolean},
	vertical: {type: Types.Select, required: true, options: verticals, initial: true},
	tiles: {type: Types.Relationship, ref: 'Tile', many: true},
	testimonials: {type: Types.Relationship, ref: 'Testimonial', many: true},
	companies: {type: Types.Relationship, ref: 'Company', many: true},
})

Broker.add(shareOfVoiceAttributes)
Broker.add(verifiedCommonAttribute)

Broker.schema.pre('validate', async function (next) {
		if (!this.default) {
			let defaultBroker = await keystone.list('Broker').model.findOne({
				default: true,
				vertical: this.vertical,
				uuid: {$ne: this.uuid},
			}).lean().exec()
			if (!defaultBroker) {
				next(Error('Their should be at least one default broker per vertical'))
			}
		}
		next()
	}
)

Broker.schema.pre('save', async function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}

	if (this.default) {
		await keystone.list('Broker').model.update({default: true, vertical: this.vertical, uuid: {$ne: this.uuid}}, {$set: {default: false}}, {multi: true})
	}
	next()
})

Broker.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

Broker.defaultColumns = 'uuid, name, displayName, default, slug, vertical, acl, abn'
Broker.register()

