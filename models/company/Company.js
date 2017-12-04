var keystone = require('keystone')
var uuid = require('node-uuid')
var Types = keystone.Field.Types
var { imageStorage } = require('../helpers/fileStorage')
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

var utils = keystone.utils

var Company = new keystone.List('Company', {
    track: true,
})

Company.add({
	name: { type: Types.Text, required: true, index: true, unique: true },
	displayName: { type: Types.Text, required: true, initial: true },
	shortName: { type: Types.Text },
	parentCompany: { type: Types.Relationship, ref: 'Company' },
	otherNames: { type: Types.TextArray },
	type: {
		type: Types.Select,
		required: true,
		initial: true,
		options: 'Major bank, Regional bank, Foreign bank, Mutual bank, Credit union, Building society, Peer to Peer,  Online lender, Non-bank Lender, Other',
	},
	isDiscontinued: { type: Types.Boolean, indent: true, default: false },
	abnOrAcn: { type: Types.Number },
	phoneNumber: { type: Types.Text },
	acl: { type: Types.Number },
	afsl: { type: Types.Number },
	uuid: { type: Types.Text, initial: true, noedit: true, unique: true },
	slug: { type: Types.Text, unique: true, required: true, initial: true },
	legacyCode: { type: Types.Text, noedit: true },
	url: { type: Types.Url, required: true, index: true, initial: true },
	searchKeyword: { type: Types.TextArray },
	logo: imageStorage('company'),
	blurb: { type: Types.Code, height: 250, language: 'html' },
})
Company.add(verifiedCommonAttribute)
Company.relationship({ path: 'ATMs', ref: 'ATM', refPath: 'company' })
Company.relationship({ path: 'Branches', ref: 'Branch', refPath: 'company' })
Company.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })
Company.relationship({ path: 'brokers', ref: 'Broker', refPath: 'companies' })
Company.relationship({ path: 'sponsoredLinks', ref: 'SponsoredLink', refPath: 'company' })

Company.schema.pre('validate', function (next) {
	if (this.phoneNumber && !/^[0-9 ()]+$/.test(this.phoneNumber)) {
		next(Error('Phone number can only have spaces, numbers and parenthesis'))
	}
	next()
})

Company.schema.pre('save', async function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}

  if (!this.slug) {
    this.slug = utils.slug(this.name.toLowerCase())
  }
	await changeLogService(this)
	next()
})

Company.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

Company.schema.methods.remove = function (callback) {
  this.isDiscontinued = true
  return this.save(callback)
}

Company.defaultSort = 'isDiscontinued, name'
Company.defaultColumns = 'name, url, displayName, searchKeyword, createdAt'
Company.searchFields = 'name, url, displayName, searchKeyword'
Company.register()
