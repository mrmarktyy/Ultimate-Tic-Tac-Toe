const keystone = require('keystone')
const _ = require('lodash')
const Company = keystone.list('Company')

exports = module.exports = async(req, res) => {
	let view = new keystone.View(req, res)
	let locals = res.locals
	locals.section = 'ConversionPixel'
	view.on('init', async(next) => {
		let companies = await Company.model.find({$or: [{isDiscontinued: false}, {isDiscontinued: {$exists: false}}]}).lean().exec()
		locals.companies = _.sortBy(companies, 'name')
		locals.loggedIn = !!locals.user
		next()
	})

	// Render the view
	view.render('generateConversionPixel')
}
