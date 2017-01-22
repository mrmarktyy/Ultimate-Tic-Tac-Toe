var keystone = require('keystone')
var Types = keystone.Field.Types
var uniqueValidator = require('mongoose-unique-validator')

var Branch = new keystone.List('Branch')

Branch.add({
  company: {
    type: Types.Relationship,
    ref: 'Company',
    required: true,
    initial: true,
    unique: true,
    index: true,
    noedit: true,
  },
  numberOfBranches: {type: Types.Number},
  openingHoursMonToFri: {type: Types.Text},
  openingHoursSat: {type: Types.Text},
  openingHoursSun: {type: Types.Text},
})

Branch.track = true
Branch.schema.plugin(uniqueValidator)
Branch.defaultSort = 'company'
Branch.defaultColumns = 'company, numberOfBranches, openingHoursMonToFri, openingHoursSat, openingHoursSun'
Branch.searchFields = 'company'
Branch.register()
