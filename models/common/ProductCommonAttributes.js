var keystone = require('keystone');
var Types = keystone.Field.Types;

module.exports = {
	name: {type: Types.Text, required: true, initial: true, index: true},
	otherNames: {type: Types.TextArray},
	displayName: {type: Types.Text, required: true, initial: true},
	isDiscontinued: {type: Types.Boolean, default: false},
	isFeaturedProduct: {type: Types.Boolean, default: false},
	isPromotedProduct: {type: Types.Boolean, default: false},
	slug: {type: Types.Text}
}
