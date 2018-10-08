var keystone = require('keystone')
var Types = keystone.Field.Types
var verticals = require('../helpers/verticals')

var Coefficient = new keystone.List('Coefficient', {
    track: true,
})

Coefficient.add({
	vertical: {type: Types.Select, required: true, options: verticals, initial: true},
	companyBoostScore: {type: Types.Number, default: 0.0, initial: true},
	clickRatio: {type: Types.Number, default: 0.0, initial: true},
	ecpc: {type: Types.Number, default: 0.0, initial: true},
	budgetRemaining: {type: Types.Number, default: 0.0, initial: true},
	productRating: {type: Types.Number, default: 0.0, initial: true},
	intercept: {type: Types.Number, default: 0.0, initial: true},
})

Coefficient.defaultColumns = 'vertical, companyBoostScore, clickRatio, ecpc, budgetRemaining, productRating, intercept'
Coefficient.register()
