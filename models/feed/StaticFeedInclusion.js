var keystone = require('keystone');
var Types = keystone.Field.Types;
var ImageMIMETypes = require('../helpers/images')
var blazeCallback = require('../helpers/blazeCallback.js')
var imageStorage = require('../helpers/fileStorage')

var StaticFeedInclusion = new keystone.List('StaticFeedInclusion');

StaticFeedInclusion.add({
	name: {type: Types.Text, initial: true, required: true},
	description: {type: Types.Text, initial: true, required: true},
	url: {type: Types.Text, initial: true, required: true},
	image: imageStorage('static-feed-inclusion'),
	feed: {
		type: Types.Relationship,
		required: true,
		initial: true,
		ref: 'StaticFeed'
	},
});

StaticFeedInclusion.schema.post('save', blazeCallback('feed_content'))

StaticFeedInclusion.defaultColumns = 'name, feed, description, url, image';
StaticFeedInclusion.register();
