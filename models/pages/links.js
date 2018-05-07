var keystone = require('keystone')
var Types = keystone.Field.Types

var Link = new keystone.List('Link', {track: true}).add({
	name: {type: Types.Text, initial: true},
	url: {type: Types.Url, initial: true},
})

Link.relationship({path: 'pages', ref: 'Pages', refPath: 'links'});
Link.defaultColumns = 'name, url'
Link.register()


