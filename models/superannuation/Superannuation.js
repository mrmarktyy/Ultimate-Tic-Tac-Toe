const keystone = require('keystone')
const uuid = require('node-uuid')
const _ = require('lodash')

const productCommonAttributes = require('../common/ProductCommonAttributes')
const changeLogService = require('../../services/changeLogService')
var discontinuedService = require('../../services/discontinuedService')
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
	oldUuid: { type: Types.Text, noedit: true },
	fy: { type: Types.Number },
	month: { type: Types.Number },
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
	monthlyClicks: {type: Types.Number, noedit: true, min: 0, default: 0},
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
	if (!this.slug || utils.slug(this.slug.toLowerCase()) !== this.slug) {
		this.slug = utils.slug(this.name.toLowerCase())
  }
	const fundGroup = await keystone.list('FundGroup').model.findOne({_id: this.fundgroup}).exec()
	this.company = fundGroup.company || this.company
	let superannuation = await Superannuation.model.findOne({uuid: this.uuid}).populate('fundgroup company').lean().exec()
	if (superannuation && superannuation.isDiscontinued != this.isDiscontinued) {
		const urlsToBeUpdated = []
		const company = superannuation.fundgroup ? superannuation.fundgroup : superannuation.company
		if(superannuation.superannuation) {
			urlsToBeUpdated.push(`/superannuation/${company.slug}/${superannuation.slug}`)
		}
		if(superannuation.pension) {
			urlsToBeUpdated.push(`/pension-funds/${company.slug}/${superannuation.slug}`)
		}
		urlsToBeUpdated.length && await discontinuedService(this, { urls: urlsToBeUpdated, isDiscontinued: this.isDiscontinued })
	}
	await changeLogService(this)
	next()
})

Superannuation.schema.methods.remove = function (callback) {
  this.isDiscontinued = true
  return this.save(callback)
}

Superannuation.defaultColumns = 'product_name, company, superannuation, pension, fundgroup'
Superannuation.defaultSort = 'isDiscontinued'
Superannuation.searchFields = 'group_code, product_id, product_name, uuid'
Superannuation.drilldown = 'fundgroup, company'
Superannuation.register()
