var keystone = require('keystone')
var verticals = require('../helpers/verticals')
var changeLogService = require('../../services/changeLogService')
var Types = keystone.Field.Types

var SaleEventProduct = new keystone.List('SaleEventProduct', {
    track: true,
})

SaleEventProduct.add({
  uuid: {type: Types.Text, initial: true},
	vertical: {type: Types.Select, required: true, options: verticals, initial: true},
	name: {type: Types.Text, required: true, initial: true, index: true},
	description: {type: Types.Text, required: false, initial: true},
  sortOrder: {type: Types.Number, default: 0, initial: true},
})

SaleEventProduct.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })
SaleEventProduct.relationship({ path: 'saleEventProductFields', ref: 'SaleEventProductField', refPath: 'product', many: true })

SaleEventProduct.schema.index({uuid: 1, vertical: 1}, {unique: true})

SaleEventProduct.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

SaleEventProduct.defaultColumns = 'uuid, vertical, name, notes'
SaleEventProduct.register()
