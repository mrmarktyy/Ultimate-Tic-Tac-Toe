var keystone = require('keystone')
var uuid = require('node-uuid')
var Types = keystone.Field.Types
var verticals = require('../helpers/verticals')
var {imageStorage} = require('../helpers/fileStorage')

var Broker = new keystone.List('Broker').add({
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
	phone: {type: Types.Text},
	pros: {type: Types.TextArray},
	lender: {type: Types.Boolean},
	vertical: {type: Types.Select, required: true, options: verticals, initial: true},
	tiles: {type: Types.Relationship, ref: 'Tile', many: true},
	testimonials: {type: Types.Relationship, ref: 'Testimonial', many: true},
	companies: {type: Types.Relationship, ref: 'Company', many: true},
})

Broker.schema.pre('save', async function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}
	next()
})

Broker.defaultColumns = 'uuid, name, displayName, slug, acl, abn'
Broker.register()

