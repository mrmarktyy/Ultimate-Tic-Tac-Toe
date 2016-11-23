var keystone = require('keystone');
var salesforceVerticals = require('../helpers/salesforceVerticals');

var Types = keystone.Field.Types;
var Monetize = new keystone.List('Monetize');

var verticals = [];
for (let vertical in salesforceVerticals) {
  verticals.push(vertical);
}

Monetize.add({
  uuid: { type: Types.Text },
  vertical: { type: Types.Select, options: verticals },
  applyUrl:  { type: Types.Text },
  enabled: { type: Types.Boolean },
  product: { type: Types.Relationship },
});

Monetize.schema.index({ uuid: 1, vertical: 1 }, { unique: true });
Monetize.track = true;

Monetize.register();
