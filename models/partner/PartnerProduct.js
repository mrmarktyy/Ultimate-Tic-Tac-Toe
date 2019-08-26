var keystone = require('keystone')
var mongoose = require('mongoose')
var uuid = require('node-uuid')
var Types = keystone.Field.Types
var verticals = require('../helpers/verticals')
var changeLogService = require('../../services/changeLogService')
var productService = require('../../services/productService')
const newRedshiftQuery = require('../../utils/newRedshiftQuery')
const redshift2Node = require('../../utils/ratecityRedshiftQuery')

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
  notes: { type: Types.Textarea, initial: false, default: null },
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
  let vertical
  if (products['Personal Loans']) {
    vertical = 'Personal Loans'
  } else {
    vertical = Object.keys(products)[0]
  }
  this.verticalProduct = products[vertical][0]
  this.vertical = verticals.find((record) => record.label === vertical).value

  this.partnerName = this.partners.length > 1 ? `Partners` : (await Partner.model.findOne({_id: mongoose.Types.ObjectId(this.partners[0])}).lean()).name
  if (this.verticalProduct.company) {
    this.company = this.verticalProduct.company._id
  }
  this.name = this.partnerName + ' - ' + this.verticalProduct.name
  this.wasNew = this.isNew
  this.wasModified = this.isModified()

  await changeLogService(this)
  next()
})

PartnerProduct.schema.methods.remove = function (callback) {
  this.isDiscontinued = true
  return this.save(callback)
}

PartnerProduct.schema.post('save', async function (doc, next) {
  if (process.env.NODE_ENV === 'production' || process.env.RC_PARTNER === 'true') {
    let partnerArray = this.partners.map((rec) => { return mongoose.Types.ObjectId(rec) })
    let partnerNames = await Partner.model.distinct('name', {_id: {$in: partnerArray}})
    let vertical = verticals.find((record) => record.value === this.vertical).label
    new Promise(() => {
      let product = this.verticalProduct
      let companyObject = product.company || {}

      if (this.wasNew) {
        let sqlInsert = `insert into rc_partner_products values
        ('${this._id}', '${this.name}', '${partnerNames}', 
        '${companyObject.name}', '${companyObject.uuid}', 
        '${this.parentUuid}', '${this.uuid}', '${vertical}',
        '${this.gotoSiteUrl}', ${this.isPhantomProduct},
        ${this.isBlacklisted}, '${this.notes || ''}', ${this.isDiscontinued})
        `
        newRedshiftQuery(sqlInsert)
      } else if (this.wasModified) {
        let sqlUpdate = `update rc_partner_products set
        id = '${this._id}', name = '${this.name}', 
        partners = '${partnerNames}', 
        companyname = '${companyObject.name}', companyuuid = '${companyObject.uuid}', 
        parentuuid = '${this.parentUuid}', uuid = '${this.uuid}', vertical = '${vertical}',
        gotositeurl = '${this.gotoSiteUrl}', isphantomproduct = ${this.isPhantomProduct},
        isblacklisted = ${this.isBlacklisted}, notes = '${this.notes || ''}', 
        isdiscontinued = ${this.isDiscontinued}
        where id = '${this._id}'
        `
        newRedshiftQuery(sqlUpdate)
        redshift2Node(sqlUpdate)
      }
    }).catch((error) => {
      console.log(error)
    })
  }
  next()
})

PartnerProduct.defaultSort = 'isDiscontinued'
PartnerProduct.defaultColumns = 'name, partners, company, parentUuid, uuid, vertical'
PartnerProduct.register()
