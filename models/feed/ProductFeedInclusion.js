var keystone = require('keystone');
var Types = keystone.Field.Types;

var ProductFeedInclusion = new keystone.List('ProductFeedInclusion');

ProductFeedInclusion.add({
  productUuid: {type: Types.Text, required: true, index: true, initial: true},
  name: {type: Types.Text, initial: true, required: true},
  feed: {type: Types.Relationship, required: true, initial: true, ref: 'ProductFeed'},
});

ProductFeedInclusion.defaultColumns = 'name, feed, productUuid';
ProductFeedInclusion.register();
