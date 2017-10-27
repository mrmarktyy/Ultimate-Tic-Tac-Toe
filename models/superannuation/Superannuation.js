const keystone = require('keystone')
const uuid = require('node-uuid')
const _ = require('lodash')

const productCommonAttributes = require('../common/ProductCommonAttributes')
const changeLogService = require('../../services/changeLogService')
const fields = require('./constants').fields
const Types = keystone.Field.Types
const utils = keystone.utils

const Superannuation = new keystone.List('Superannuation', {
	track: true,
})

const schema = {
	fenixLogo: { type: Types.Text },
	pension: {type: Types.Boolean, indent: true, noedit: true},
	superannuation: {type: Types.Boolean, indent: true, noedit: true},
	productUrl: { type: Types.Text },
	fy: { type: Types.Number },
	fundgroup: {
		type: Types.Relationship,
		ref: 'FundGroup',
		initial: true,
		index: true,
		noedit: true,
	},
	company: {
		type: Types.Relationship,
		ref: 'Company',
		initial: true,
		noedit: true,
	},
}
_.forEach(_.values(fields), (attribute) => {
	schema[attribute] = { type: Types.Text }
})

Superannuation.add(productCommonAttributes)
Superannuation.add(schema)

Superannuation.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })
Superannuation.schema.index({ fundgroup: 1, product_name: 1 }, { unique: true })

Superannuation.schema.pre('save', async function (next) {
	this.uuid = this.uuid || uuid.v4()
	this.slug = this.slug || utils.slug(this.name.toLowerCase())
	const fundGroup = await keystone.list('FundGroup').model.findOne({_id: this.fundgroup}).exec()
	this.company = fundGroup.company || this.company
	await changeLogService(this)
	next()
})

Superannuation.defaultColumns = 'product_name, company, group_name, fundgroup'
Superannuation.searchFields = 'group_code, group_name, product_id, product_name, uuid'
Superannuation.drilldown = 'fundgroup'
Superannuation.register()
