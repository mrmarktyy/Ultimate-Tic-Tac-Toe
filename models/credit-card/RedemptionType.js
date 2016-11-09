var keystone = require('keystone');
var Types = keystone.Field.Types;

var RedemptionType = new keystone.List('RedemptionType');

RedemptionType.add({
  name: { type: Types.Text, required: true, initial: true, index: true },
});

Program.schema.pre('remove', function (next) {
  next(Error('You cannot remove a redemption type'));
});

RedemptionType.schema.index({ name: 1 }, { unique: true });
RedemptionType.track = true;
RedemptionType.defaultColumns = 'name';
RedemptionType.register();
