var keystone = require('keystone');
var Types = keystone.Field.Types;

var Program = new keystone.List('Program');

Program.add({
  name: { type: Types.Text, required: true, initial: true, index: true },
  isReward: { type: Types.Boolean, indent: true, default: false, initial: true },
  isPartner: { type: Types.Boolean, indent: true, default: false, initial: true },
});

Program.schema.index({ name: 1 }, { unique: true });
Program.track = true;
Program.defaultColumns = 'name, isReward, isPartner';
Program.register();
