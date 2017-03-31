var keystone = require('keystone')
var Types = keystone.Field.Types

var ProductFeed = new keystone.List('ProductFeed')

ProductFeed.add({
  name: {type: Types.Text, required: true, index: true, initial: true},
  slug: {type: Types.Text, required: true, index: true, initial: true},
})

ProductFeed.relationship({ path: 'product-feed-inclusions', ref: 'ProductFeedInclusion', refPath: 'feed' })

ProductFeed.defaultColumns = 'name, slug'
ProductFeed.register()
