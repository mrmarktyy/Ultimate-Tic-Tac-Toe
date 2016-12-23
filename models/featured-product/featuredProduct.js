var keystone = require('keystone');
var { imageStorage } = require('../helpers/fileStorage');
var verticals = require('../helpers/verticals');
var Types = keystone.Field.Types;

var FeaturedProduct = new keystone.List('FeaturedProduct');

FeaturedProduct.add({
  uuid: { type: Types.Text, initial: true },
  vertical: { type: Types.Select, required: true, options: verticals, initial: true },
  title: { type: Types.Text, required: true, initial: true, index: true },
  description: { type: Types.Text, required: true, initial: true },
  sortOrder: { type: Types.Number, default: 1, initial: true },
  dateStart: { type: Types.Datetime, required: true, initial: true },
  dateEnd: { type: Types.Datetime, initial: true },
  enabled: { type: Types.Boolean, indent: true, required: true, default: true, initial: true },
  image: imageStorage('featuredProduct'),
});

FeaturedProduct.schema.pre('validate', function (next) {
  if ((this.dateEnd !== null) && (this.dateEnd < this.dateStart)) {
    next(Error('End date has to be greater than start date'));
  } else {
    next();
  }
});

FeaturedProduct.schema.index({ uuid: 1, vertical: 1 }, { unique: true });

FeaturedProduct.track = true;
FeaturedProduct.defaultColumns = 'uuid, vertical, title, description, dateStart, dateEnd';
FeaturedProduct.register();
