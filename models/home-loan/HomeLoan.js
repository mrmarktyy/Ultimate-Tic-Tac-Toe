var keystone = require('keystone')
var uuid = require('node-uuid')
var frequency = require('./paymentFrequencies')
var availableOptions = require('../attributes/availableOptions')
var productCommonAttributes = require('../common/ProductCommonAttributes')
var changeLogService = require('../../services/changeLogService')

var Types = keystone.Field.Types

var HomeLoan = new keystone.List('HomeLoan', {
  track: true,
})

HomeLoan.add(productCommonAttributes)

HomeLoan.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    index: true,
    noedit: true,
  },
  homeLoanFamily: {
    type: Types.Relationship,
    ref: 'HomeLoanFamily',
    initial: true,
    index: true,
    filters: { company: ':company' },
  },
  neo4jId: {type: Types.Number, noedit: true},
  homeLoanType: { type: Types.Select, initial: true, required: true, options: ['VARIABLE', 'FIXED'], emptyOption: false },
  isPackage: { type: Types.Boolean, indent: true, default: false },
  isBasicVariable: { type: Types.Boolean, indent: true, default: false },
  isRCSpecial: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
  availableTo457VisaHolders: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
  isCombinationLoan: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
  repaymentFrequencies: { type: Types.MultiSelect, options: frequency, required: true, initial: true },
  applicationOptions: {
    type: Types.MultiSelect,
    options: ['ONLINE', 'IN_BRANCH', 'PHONE', 'MOBILE_BROKER', 'BROKER'],
    required: true,
    initial: true,
  },
  propertyPurposeTypes: {
    type: Types.MultiSelect,
    options: ['OWNER_OCCUPIED', 'INVESTMENT'],
    required: true,
    initial: true,
  },
  repaymentTypes: {
    type: Types.MultiSelect,
    options: ['INTEREST_ONLY', 'PRINCIPAL_AND_INTEREST'],
    required: true,
    initial: true,
  },
  description: { type: Types.Text },
  otherBenefits: { type: Types.Text },
  otherRestrictions: { type: Types.Text },
  adminNotes: { type: Types.Text },
  howToApplyBlurb: {type: Types.Code, height: 250, language: 'html'},
  eligibilityBlurb: {type: Types.Code, height: 150, language: 'html'},
  comparisonRateDisclaimer: {type: Types.Code, height: 50, language: 'html'},
})

HomeLoan.relationship({ path: 'homeLoanVariations', ref: 'HomeLoanVariation', refPath: 'product' })
HomeLoan.relationship({ path: 'offsetAccounts', ref: 'OffsetAccount', refPath: 'product' })
HomeLoan.relationship({ path: 'extraRepayments', ref: 'ExtraRepayment', refPath: 'product' })
HomeLoan.relationship({ path: 'redrawFacilities', ref: 'RedrawFacility', refPath: 'product' })
HomeLoan.relationship({ path: 'fees', ref: 'Fee', refPath: 'product' })
HomeLoan.relationship({ path: 'features', ref: 'Feature', refPath: 'product' })
HomeLoan.relationship({ path: 'conditions', ref: 'Condition', refPath: 'product' })
HomeLoan.relationship({ path: 'homeLoanSpecial', ref: 'HomeLoanSpecial', refPath: 'product' })

HomeLoan.schema.pre('validate', async function (next) {
  let variation = await keystone.list('HomeLoanVariation').model.findOne({product: this._id, isDiscontinued: false, isMonetized: true}).lean().exec()
  if (variation && Object.keys(variation).length > 0 && variation.isMonetized && this.isDiscontinued) {
    next(Error('Cannot discontinue a product with an active variation that is monetized. UUID ' + variation.uuid))
  }
  next()
})

HomeLoan.schema.pre('save', async function (next) {
  if (!this.uuid) {
    this.uuid = uuid.v4()
  }
  let product = await keystone.list('HomeLoan').model.findOne({uuid: this.uuid}).lean().exec()
  if (product && product.isDiscontinued != this.isDiscontinued) {
    await keystone.list('HomeLoanVariation').model.update({product: this._id}, {$set: {isDiscontinued: this.isDiscontinued}}, {multi: true})
  }

  await changeLogService(this)
  next()
})

HomeLoan.schema.methods.remove = function (callback) {
  this.isDiscontinued = true
  return this.save(callback)
}

HomeLoan.defaultColumns = 'name, company, homeLoanType, propertyPurposeTypes, repaymentTypes'
HomeLoan.defaultSort = 'isDiscontinued'
HomeLoan.register()
