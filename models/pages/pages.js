var keystone = require('keystone')
var uuid = require('node-uuid')
var Types = keystone.Field.Types
var verticals = require('../helpers/verticals')
var {imageStorage} = require('../helpers/fileStorage')

const Pages = new keystone.List('Pages').add({
	url: {type: Types.Text, initial: true, unique: true},
	header: {type: Types.Text, initial: true},
	tagline: {type: Types.Text, initial: true},
	title: {type: Types.Text, initial: true},
	vertical: {type: Types.Select, options: verticals, initial: true},
	resultName: {type: Types.Text},
	description: {type: Types.Code, height: 250, language: 'html'},
	keywords: {type: Types.TextArray},
	canonical: {type: Types.Text},
	category: {type: Types.Text},
	userJourneyStage: {type: Types.Text},
	faq_type: {type: Types.Text},
	faq_url: {type: Types.Text},
	og: {
		id: {type: Types.Text},
		title: {type: Types.Text},
		description: {type: Types.Text},
		image: {type: Types.Text},
	},
	twitter: {
		title: {type: Types.Text},
		description: {type: Types.Text},
		creator: {type: Types.Text},
		image: {type: Types.Text},
	},
	google: {
		name: {type: Types.Text},
		description: {type: Types.Text},
		image: {type: Types.Text},
	},
	featuredImage: imageStorage('featuredImage')

})
Pages.schema.pre('save', async function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}
	next()
})

Pages.defaultColumns = 'uuid, url, title, tagline, vertical'
Pages.register()

