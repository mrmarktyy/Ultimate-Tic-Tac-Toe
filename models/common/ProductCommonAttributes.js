var keystone = require('keystone');
var Types = keystone.Field.Types;

module.exports = {
	name: { type: Types.Text, required: true, initial: true, index: true },
  uuid: { type: Types.Text, initial: true, noedit: true }, // this should be unique, however, team don't have the data yet. will make this unique once all data loaded.
	otherNames: { type: Types.TextArray },
	displayName: { type: Types.Text, required: true, initial: true },
	isDiscontinued: { type: Types.Boolean, indent: true, default: false },
	isFeaturedProduct: { type: Types.Boolean, indent: true, default: false },
	isPromotedProduct: { type: Types.Boolean, indent: true, default: false },
	slug: { type: Types.Text },
  visibility: { type: Types.Select, options: ['seo', 'none', 'all'], default: 'all', required: true, initial: true },
};
