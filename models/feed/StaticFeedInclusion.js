var keystone = require('keystone');
var Types = keystone.Field.Types;
var ImageMIMETypes = require('../helpers/images')
var blazeCallback = require('../helpers/blazeCallback.js')

var StaticFeedInclusion = new keystone.List('StaticFeedInclusion');
var s3Storage = new keystone.Storage({
  adapter: require('keystone-storage-adapter-s3'),
  s3: {
    path: 'keystone',
    headers: {
      'x-amz-acl': 'public-read',
    }
  }
});

StaticFeedInclusion.add({
  name: {type: Types.Text, initial: true, required: true},
  description: {type: Types.Text, initial: true, required: true},
  url: {type: Types.Text, initial: true, required: true},
  image: {
    type: Types.File,
    storage: s3Storage
  },
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
