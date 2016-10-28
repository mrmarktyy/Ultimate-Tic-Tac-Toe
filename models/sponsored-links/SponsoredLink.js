var keystone = require('keystone');
var imageStorage = require('../helpers/fileStorage');
var verticals = require('../helpers/verticals');
var Types = keystone.Field.Types;

var SponsoredLink = new keystone.List('SponsoredLink');

SponsoredLink.add({
    company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    index: true,
    noedit: false
  },
  title: { type: Types.Text, required: true, initial: true, index: true },
  description: { type: Types.Text, required: true, initial: true },
  legacyCode: { type: Types.Text },
  sorbetId: { type: Types.Number },
  vertical: { type: Types.Select, required: true, options: verticals, initial: true },
  style: { type: Types.Text },
  countryCode: { type: Types.Text },
  dateStart: { type: Types.Datetime, required: true, initial: true },
  dateEnd: { type: Types.Datetime, initial: true },
  sortOrder: { type: Types.Number, default: 1, initial: true },
  state: { type: Types.Number },
  cap: { type: Types.Number },
  capRemain: { type: Types.Number },
  revenue: { type: Types.Money },
  enabled: { type: Types.Boolean, required: true, default: true, initial: true },
  applyUrl: { type: Types.Url, required: true, initial: true },
  messages: { type: Types.Text },
  image: imageStorage('sponsoredLink'),
});

SponsoredLink.schema.pre('validate', function (next) {
  if ((this.dateEnd !== undefined) && (this.dateEnd < this.dateStart)) {
    next(Error('End date has to be greater than start date'));
  } else {
    next();
  }
});

SponsoredLink.schema.index({ company: 1, vertical: 1, title: 1 }, { unique: true });

SponsoredLink.track = true;
SponsoredLink.defaultColumns = 'vertical, company, title, description, uuid, dateStart, dateEnd';
SponsoredLink.drilldown = 'company';
SponsoredLink.register();

