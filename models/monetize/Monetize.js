var keystone = require('keystone');
var verticalModel = require('../helpers/verticalModel');

var Types = keystone.Field.Types;
var Monetize = new keystone.List('Monetize');

var verticals = [];
for (let vertical in verticalModel) {
  verticals.push(vertical);
}

Monetize.add({
  uuid: { type: Types.Text },
  vertical: { type: Types.Select, options: verticals },
  deliveryType: { type: Types.Text },
  applyUrl:  { type: Types.Text },
  product: { type: Types.Relationship },
});

Monetize.schema.index({ uuid: 1, vertical: 1 }, { unique: true });
Monetize.track = true;

Monetize.register();
