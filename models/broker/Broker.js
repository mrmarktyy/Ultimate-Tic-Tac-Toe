var keystone = require('keystone')
var uuid = require('node-uuid')
var Types = keystone.Field.Types
var verticals = require('../helpers/verticals')
var {imageStorage} = require('../helpers/fileStorage')
var shareOfVoiceAttributes = require('../common/ShareOfVoiceCommonAttributes')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')
var verifiedService = require('../../services/verifiedService')
var utils = keystone.utils

var Broker = new keystone.List('Broker', {track: true}).add({
	uuid: {type: Types.Text, initial: true, noedit: true, unique: true},
	name: {type: Types.Text, initial: true, unique: true},
	slug: {type: Types.Text, initial: true, require: true, unique: true},
	displayName: {type: Types.Text, required: true, initial: true},
	acl: {type: Types.Text},
	abn: {type: Types.Text},
	cid: {type: Types.Text},
	formHeader: {type: Types.Text},
	title: {type: Types.Text},
	description: {type: Types.Code, height: 250, language: 'html'},
	about: {type: Types.Code, height: 250, language: 'html'},
	promotionalTermsAndCondition: {type: Types.Code, height: 250, language: 'html'},
	disclaimer: {type: Types.Code, height: 250, language: 'html'},
	guideDisplayName: {type: Types.Text},
	guidePdfUrl: {type: Types.Text},
	sendGuideEmail: {type: Types.Boolean, initial: true},
	email: {type: Types.TextArray},
	logo: imageStorage('Broker'),
	backgroundImage: imageStorage('brokerBackgroundImage'),
	imageHeader: imageStorage('brokerHeader'),
	guideImageHeader: imageStorage('brokerHeader'),
	photo: imageStorage('brokerPhoto'),
  isDiscontinued: {type: Types.Boolean, initial: true, require: true, index: true},
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
		if (this.default) {
			let defaultBroker = await keystone.list('Broker').model.findOne({
				default: true,
				vertical: this.vertical,
				uuid: {$ne: this.uuid},
			}).lean().exec()
			if (defaultBroker) {
				next(Error(`There can only be one default broker per vertical. Please remove the existing default broker for '${this.vertical}' before replacing with a new one`))
			}
		}
		next()
	}
)

Broker.schema.pre('save', async function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}
  if (!this.slug) {
		this.slug = utils.slug(this.name.toLowerCase())
  }
  if (utils.slug(this.slug.toLowerCase()) !== this.slug) {
    this.slug = utils.slug(this.slug.toLowerCase())
  }

	if (this.default) {
		await keystone.list('Broker').model.update({default: true, vertical: this.vertical, uuid: {$ne: this.uuid}}, {$set: {default: false}}, {multi: true})
	}
	next()
})

Broker.schema.post('save', async function () {
	await verifiedService(this)
})

Broker.defaultColumns = 'uuid, name, displayName, default, slug, vertical, acl, abn, isDiscontinued'
Broker.register()
