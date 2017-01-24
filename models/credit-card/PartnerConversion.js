var keystone = require('keystone')
var Types = keystone.Field.Types

var PartnerConversion = new keystone.List('PartnerConversion')

PartnerConversion.add({
  rewardProgram: {
    type: Types.Relationship,
    ref: 'Program',
    filters: { isReward: true },
    required: true,
    initial: true,
    index: true,
    noedit: false,

  },
  partnerProgram: {
    type: Types.Relationship,
    ref: 'Program',
    filters: { isPartner: true },
    required: true,
    initial: true,
    index: true,
    noedit: false,

  },
  conversionRate: { type: Types.Number, min: 0, initial: true, required: true },
})

PartnerConversion.schema.index({ rewardProgram: 1, partnerProgram: 1 }, { unique: true })

PartnerConversion.track = true
PartnerConversion.defaultColumns = 'rewardProgram, partnerProgram, conversionRate'
PartnerConversion.register()
