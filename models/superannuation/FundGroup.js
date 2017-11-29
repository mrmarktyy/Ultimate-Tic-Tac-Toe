const keystone = require('keystone')
const uuid = require('node-uuid')

const { imageStorage } = require('../helpers/fileStorage')
const changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')
const FundGroup = new keystone.List('FundGroup', {
	track: true,
})
const Types = keystone.Field.Types
const utils = keystone.utils

FundGroup.add({
	uuid: { type: Types.Text, initial: true, noedit: true, unique: true },
	slug: { type: Types.Text, index: true, initial: true },
	name: { type: Types.Text },
	type: { type: Types.Text },
	company: {
		type: Types.Relationship,
		ref: 'Company',
		initial: true,
		index: true,
	},
	fundName: { type: Types.Text },
	groupName: { type: Types.Text },
	groupCode: { type: Types.Text, unique: true },
	phoneNumber: { type: Types.Text },
	website: { type: Types.Text },
	logo: imageStorage('fundGroupLogo'),
})

FundGroup.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })
FundGroup.add(verifiedCommonAttribute)
FundGroup.schema.pre('save', async function (next) {
	this.uuid = this.uuid || uuid.v4()
	this.slug = this.slug || utils.slug(this.name.toLowerCase())

	await keystone.list('Superannuation').model.update({fundgroup: this._id}, {company: this.company}, {multi: true})
	await changeLogService(this)
	next()
})

FundGroup.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

FundGroup.defaultColumns = 'name, fundName, groupName, groupCode'
FundGroup.register()
