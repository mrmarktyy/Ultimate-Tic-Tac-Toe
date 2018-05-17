const keystone = require('keystone')
const moment = require('moment')
const monthlyClicksCsv = require('../../redshift/financeMonthEnd').monthlyClicksCsv

exports.screen = (req, res) => {
  var view = new keystone.View(req, res)
  var locals = res.locals

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'home'
  let dateComponents = moment().format('YYYY MMMM').split(' ')
  locals.currentYear = dateComponents[0]
  locals.currentMonth = dateComponents[1]
  locals.years = [parseInt(locals.currentYear), parseInt(locals.currentYear) - 1]
  locals.months = moment().localeData().months()
  // Render the view
  view.render('clickReport')
}

exports.download = async (req, res) => {
  let month = req.body.month
  let year = req.body.year
  let csv = await monthlyClicksCsv(month, year)
  let fileName = `monthly-clicks-${month}-${year}.csv`
  res.set({'Content-Disposition': `attachment; filename= ${fileName}`})
  res.set('Content-Type', 'text/csv')
  res.status(200).send(csv)
}
