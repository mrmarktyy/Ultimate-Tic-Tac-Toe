var keystone = require('keystone')
var uuid = require('node-uuid')
var Types = keystone.Field.Types
var verticals = require('../helpers/verticals')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

const Pages = new keystone.List('Pages', {track: true}).add({
	uuid: {type: Types.Text, initial: true, unique: true},
	url: {type: Types.Text, initial: true, unique: true},
	header: {type: Types.Text, initial: true},
	tagline: {type: Types.Text, initial: true},
	title: {type: Types.Text, initial: true},
	popularSearchTitle: {type: Types.Text},
	vertical: {type: Types.Select, options: verticals, initial: true, default: 'default'},
	resultName: {type: Types.Text},
	description: {type: Types.Code, height: 250, language: 'html'},
	keywords: {type: Types.Text},
	canonical: {type: Types.Text},
	category: {type: Types.TextArray},
	userJourneyStage: {type: Types.Text},
	searchVolume: { type: Number, min: 0 },
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
	featuredImage: { type: Types.Url },
})
Pages.add(verifiedCommonAttribute)
Pages.schema.pre('save', async function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}
	next()
})

Pages.schema.post('save', async function () {
	await verifiedService(this)
})

Pages.defaultColumns = 'uuid, url, title, tagline, vertical'
Pages.register()
