const keystone = require('keystone')
const Types = keystone.Field.Types
const saleEventCommonAttributes = require('../common/saleEventCommonAttributes')

const SaleEventProductField = new keystone.List('SaleEventProductField', {
  track: true,
})

SaleEventProductField.add(saleEventCommonAttributes)
SaleEventProductField.add({
  product: {
    type: Types.Relationship,
    ref: 'SaleEventProduct',
    required: true,
    initial: true,
    index: true,
  },
})

SaleEventProductField.defaultColumns = 'description, value'
SaleEventProductField.register()
