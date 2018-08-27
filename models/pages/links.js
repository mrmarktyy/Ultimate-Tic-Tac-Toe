var keystone = require('keystone')
var Types = keystone.Field.Types

var Link = new keystone.List('Link', {track: true}).add({
	name: {type: Types.Text, initial: true},
	url: {type: Types.Url, initial: true},
	page: {type: Types.Relationship, ref: 'Pages', initial: true, required: true},
})

Link.relationship({path: 'pages', ref: 'Pages', refPath: 'links'});
Link.defaultColumns = 'name, url, page'
Link.register()


