var keystone = require('keystone')
var Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')

var Notifications = new keystone.List('Notifications', {
  track: true,
})

Notifications.add({
  type: {
    type: Types.Select,
    required: true,
    initial: true,
    options: 'Announcement, RBA Rate, Live Video',
  },
  text: { type: Types.Text, required: true, initial: true },
  link: { type: Types.Url, required: true, index: true, initial: true },
  dateStart: { type: Types.Datetime, required: true, initial: true },
  dateEnd: { type: Types.Datetime, required: true, initial: true },
  appliedToUrl: { type: Types.Text, required: true, initial: true },
})

Notifications.schema.pre('validate', function (next) {
  if ((this.dateEnd !== null) && (this.dateEnd < this.dateStart)) {
    next(Error('End date has to be greater than start date'))
  }
  //make the text fixed size here.
  /*if (this.text.length >= 45) {
		next(Error('Title has maximum of 45 characters'))
	}*/
  next()
})

Notifications.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

Notifications.defaultColumns = 'type, text, link, startDate, endDate, appliedToUrl'
Notifications.defaultSort = 'appliedToUrl'
Notifications.register()
