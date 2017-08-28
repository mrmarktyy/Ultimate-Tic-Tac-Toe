var keystone = require('keystone')
var uuid = require('node-uuid')
var { imageStorage } = require('../helpers/fileStorage')
var verticals = require('../helpers/verticals')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')
var shareOfVoiceAttributes = require('../common/ShareOfVoiceCommonAttributes')

var SponsoredLink = new keystone.List('SponsoredLink', {
    track: true,
})

SponsoredLink.add({
    company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    index: true,
    noedit: false,
  },
	uuid: {type: Types.Text, initial: true, noedit: true, unique: true},
  name: { type: Types.Text, required: true, initial: true, index: true },
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
  url: { type: Types.Url, required: true, initial: true },
  messages: { type: Types.Text },
	imageUrl: imageStorage('sponsoredLink'),
})

SponsoredLink.add(shareOfVoiceAttributes)

SponsoredLink.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

SponsoredLink.schema.pre('validate', function (next) {
	if ((this.dateEnd !== undefined) && (this.dateEnd < this.dateStart)) {
		next(Error('End date has to be greater than start date'))
	} else if (this.name.length > 35) {
		next(Error('Name has maximum of 35 characters'))
	} else {
		next()
	}
})

SponsoredLink.schema.pre('save', async function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}

  await changeLogService(this)
  next()
})

SponsoredLink.schema.index({ company: 1, vertical: 1, name: 1 }, { unique: true })

SponsoredLink.defaultColumns = 'uuid, name, vertical, company, description, dateStart, dateEnd'
SponsoredLink.drilldown = 'company'
SponsoredLink.register()

