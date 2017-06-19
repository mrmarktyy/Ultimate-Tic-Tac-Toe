const keystone = require('keystone')
const HomeLoanVariation = keystone.list('HomeLoanVariation')
const _ = require('lodash')

exports = module.exports = async (req, res) => {

  let view = new keystone.View(req, res)
  let locals = res.locals
  locals.section = 'homeloan'

  view.on('init', async (next) => {
    HomeLoanVariation.model.find({isDiscontinued: false}).populate('company').exec((err, variations) => {
      let companies = _.uniq(variations.map((variation) => variation.company))
      locals.companies = _.sortBy(companies, 'name')
      locals.loggedIn = !!locals.user
      next()
    })
  })

  // Render the view
  view.render('importRates')
}
