var keystone = require('keystone')
var mongoose = require('mongoose')
var uuid = require('node-uuid')
var Types = keystone.Field.Types
var verticals = require('../helpers/verticals')
var changeLogService = require('../../services/changeLogService')
var productService = require('../../services/productService')

var Partner = keystone.list('Partner')

var PartnerProduct = new keystone.List('PartnerProduct', {
  track: true,
})

PartnerProduct.add({
  name: { type: Types.Text, required: false, noedit: true, initial: false },
  partners: {
    type: Types.Relationship,
    required: true,
    initial: true,
    ref: 'Partner',
    noedit: false,
    many: true,
  },
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: false,
    initial: false,
    index: false,
    noedit: true,
  },
  parentUuid: { type: Types.Text, required: true, initial: true },
  uuid: { type: Types.Text, noedit: true },
  vertical: { type: Types.Select, options: verticals, noedit: true },
  gotoSiteUrl: { type: Types.Url, required: true, initial: true },
  isPhantomProduct: { type: Types.Boolean, indent: true, default: true },
  isBlacklisted: { type: Types.Boolean, indent: true, default: false },
  notes: { type: Types.Textarea, initial: false },
  isDiscontinued: { type: Types.Boolean, indent: true, default: false },
})

PartnerProduct.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })

PartnerProduct.schema.pre('validate', async function (next) {
  let products = await productService({uuid: this.parentUuid})
  let product = ([].concat(...Object.values(products)))[0]
  if (product === undefined) {
    next(Error('No product with uuid ' + this.parentUuid))
  }
  next()
})

PartnerProduct.schema.pre('save', async function (next) {
  if (!this.uuid) {
    this.uuid = uuid.v4()
  }
  let products = await productService({uuid: this.parentUuid})
  let verticalProducts
  let vertical
  if (products['Personal Loans']) {
    verticalProducts = [].concat(...products['Personal Loans'])
    vertical = 'Personal Loans'
  } else {
    verticalProducts = [].concat(...Object.values(products))
    vertical = Object.keys(products)[0]
  }
  this.vertical = verticals.find((record) => record.label === vertical).value
  let name = this.partners.length > 1 ? `Multi` : (await Partner.model.findOne({_id: mongoose.Types.ObjectId(this.partners[0])}).lean()).name
  if (verticalProducts[0].company) {
    this.company = verticalProducts[0].company._id
  }
  this.name = name + ' - ' + verticalProducts[0].name

  await changeLogService(this)
  next()
})

PartnerProduct.schema.methods.remove = function (callback) {
  this.isDiscontinued = true
  return this.save(callback)
}

PartnerProduct.defaultSort = 'isDiscontinued'
PartnerProduct.defaultColumns = 'name, partners, company, parentUuid, uuid, vertical'
PartnerProduct.register()
