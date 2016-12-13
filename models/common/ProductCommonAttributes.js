var keystone = require('keystone');
var Types = keystone.Field.Types;

module.exports = {
	name: { type: Types.Text, required: true, initial: true, index: true },
	uuid: { type: Types.Text, initial: true }, // this should be unique, however, team don't have the data yet. will make this unique once all data loaded.
	slug: { type: Types.Text, index: true },
	otherNames: { type: Types.TextArray },
	displayName: { type: Types.Text, required: true, initial: true },
	isDiscontinued: { type: Types.Boolean, indent: true, default: false },
	isFeaturedProduct: { type: Types.Boolean, indent: true, default: false },
	isPromotedProduct: { type: Types.Boolean, indent: true, default: false },
	visibility: { type: Types.Select, options: ['seo', 'none', 'all'], default: 'all', required: true, initial: true },
};
