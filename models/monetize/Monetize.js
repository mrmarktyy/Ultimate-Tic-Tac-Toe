var keystone = require('keystone');
var Types = keystone.Field.Types;

var Monetize = new keystone.List('Monetize');

Monetize.add({
  uuid: { type: Types.Text },
  vertical: { type: Types.Text },
  deliveryType: { type: Types.Select, options: [0, 1, 2] },
  applyUrl:  { type: Types.Text },
  active: { type: Types.Boolean },
  product: { type: Types.Relationship },
});

Monetize.schema.index({ uuid: 1, vertical: 1 }, { unique: true });

Monetize.register();
