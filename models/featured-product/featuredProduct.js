var keystone = require('keystone')
var {imageStorage} = require('../helpers/fileStorage')
var verticals = require('../helpers/verticals')
var changeLogService = require('../../services/changeLogService')
var shareOfVoiceAttributes = require('../common/ShareOfVoiceCommonAttributes')
var Types = keystone.Field.Types

var FeaturedProduct = new keystone.List('FeaturedProduct', {
    track: true,
})

FeaturedProduct.add({
	uuid: {type: Types.Text, initial: true},
	vertical: {type: Types.Select, required: true, options: verticals, initial: true},
	title: {type: Types.Text, required: true, initial: true, index: true},
	description: {type: Types.Text, required: true, initial: true},
	sortOrder: {type: Types.Number, default: 1, initial: true},
	dateStart: {type: Types.Datetime, required: true, initial: true},
	dateEnd: {type: Types.Datetime, initial: true},
	enabled: {type: Types.Boolean, indent: true, required: true, default: true, initial: true},
	notes: {type: Types.Text, required: false, initial: true},
	image: imageStorage('featuredProduct'),
})

FeaturedProduct.add(shareOfVoiceAttributes)

FeaturedProduct.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

FeaturedProduct.schema.pre('validate', function (next) {
	if ((this.dateEnd !== null) && (this.dateEnd < this.dateStart)) {
		next(Error('End date has to be greater than start date'))
	}
	if (this.title.length >= 45) {
		next(Error('Title has maximum of 45 characters'))
	}
	if (this.description.length >= 135) {
		next(Error('Title has maximum of 135 characters'))
	}
	next()
})

FeaturedProduct.schema.index({uuid: 1, vertical: 1}, {unique: true})

FeaturedProduct.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

FeaturedProduct.defaultColumns = 'uuid, vertical, title, notes, sortOrder, dateStart, dateEnd'
FeaturedProduct.register()
