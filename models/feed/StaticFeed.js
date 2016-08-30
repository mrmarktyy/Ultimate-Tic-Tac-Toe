var keystone = require('keystone');
var Types = keystone.Field.Types;

var StaticFeed = new keystone.List('StaticFeed');

StaticFeed.add({
  name: {type: Types.Text, required: true, index: true, initial: true},
  slug: {type: Types.Text, required: true, index: true, initial: true}
});

StaticFeed.relationship({ path: 'static-feed-inclusions', ref: 'StaticFeedInclusion', refPath: 'feed' });

StaticFeed.defaultColumns = 'name, slug, vertical';
StaticFeed.register();
