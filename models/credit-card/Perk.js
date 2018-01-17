var keystone = require('keystone')
const Types = keystone.Field.Types
var changeLogService = require('../../services/changeLogService')
var mongoose = require('mongoose')

const Perk = new keystone.List('Perk', {
  track: true,
})

Perk.add({
  perkType: {
    type: Types.Relationship,
    ref: 'PerkType',
    required: true,
    initial: true,
    index: true,
    noedit: true,
  },
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    index: true,
    noedit: true,
  },
  product: {
    type: Types.Relationship,
    ref: 'CreditCard',
    required: true,
    initial: true,
    index: true,
    noedit: true,
    filters: {company: ':company'},
  },
  value: { type: Types.Number },
  conditions: { type: Types.Text },
  days: { type: Types.Number },
  daysConditions: { type: Types.Text },
})

Perk.schema.pre('save', async function (next) {
  if (this.value === undefined || this.value === null) {
    let perk = await keystone.list('PerkType').model.findOne({_id: this.perkType}).lean().exec()
    this.value = perk.value
  }
  await changeLogService(this)
  next()
})

Perk.defaultColumns = 'perkType, company, product, value, conditions'
Perk.register()
