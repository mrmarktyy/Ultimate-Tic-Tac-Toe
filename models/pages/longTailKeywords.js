const keystone = require('keystone')
const Types = keystone.Field.Types

const LongTailKeywords = new keystone.List('LongTailKeywords', {track: true}).add({
	name: {type: Types.Text, initial: true},
	longTailId: {type: Types.Text, initial: true, noedit: true},
	url: {type: Types.Url, initial: true},
	highlighted: {type: Types.Code, height: 50, language: 'html'},
	section: {type: Types.Text},
	title: {type: Types.Text},
	type: {type: Types.Text},
	guid: {type: Types.Text},
	snippet: {type: Types.Code, height: 250, language: 'html'},
	author_image: {type: Types.Text},
	thumbnail_image_url: {type: Types.Text},
	created_at: {type: Types.Text},
	author_name: {type: Types.Text},
	readingTime: {type: Types.Number}
})

LongTailKeywords.relationship({path: 'pages', ref: 'Pages', refPath: 'links'});
LongTailKeywords.defaultColumns = 'name, section, url, page'
LongTailKeywords.register()
