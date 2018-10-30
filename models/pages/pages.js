const keystone = require('keystone')
const uuid = require('node-uuid')
const Types = keystone.Field.Types
const verifiedService = require('../../services/verifiedService')
const verifiedCommonAttribute = require('../common/verifiedCommonAttribute')
const verticals = [...require('../helpers/verticals'), {value: 'nonspecific', label: 'Non Specific'}]

const Pages = new keystone.List('Pages', {track: true,   map: { name: 'url' },}).add({
	url: {type: Types.Text, initial: true, unique: true,  noedit: true},
	uuid: {type: Types.Text, initial: true, unique: true},
	header: {type: Types.Text, initial: true},
	tagline: {type: Types.Text, initial: true},
	title: {type: Types.Text, initial: true},
	popularSearchTitle: {type: Types.Text},
	useGenericLabels: {type: Types.Boolean, default: false},
	vertical: {type: Types.Select, options: verticals, initial: true, default: 'default'},
	resultName: {type: Types.Text},
	variant: {type: Types.Text},
	description: {type: Types.Code, height: 250, language: 'html'},
	ignoreSeoOptimisation: { type: Types.Boolean, indent: true, default: false },
	keywords: {type: Types.Text},
	canonical: {type: Types.Text},
	category: {type: Types.TextArray},
	userJourneyStage: {type: Types.Text},
	rankingScore: { type: Number, min: 0 },
	rank: { type: Number, min: 0 },
	links: {type: Types.Relationship, ref: 'Link', many: true},
	longTailPopularSearches: {type: Types.Relationship, ref: 'LongTailKeywords', many: true},
	longTailSimilarSearches: {type: Types.Relationship, ref: 'LongTailKeywords', many: true},
	longTailArticles: {type: Types.Relationship, ref: 'LongTailKeywords', many: true},
	longTailFaqs: {type: Types.Relationship, ref: 'LongTailKeywords', many: true},
	wordDisclaimerRequired: { type: Types.Boolean, indent: false, default: false },
	lowestRateProduct: { type: Types.Boolean, indent: false, default: false },
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
	cannedSearchGroup: {type: Types.Text},
})
Pages.add(verifiedCommonAttribute)
Pages.relationship({path: 'links', ref: 'Link', refPath: 'page'});
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
