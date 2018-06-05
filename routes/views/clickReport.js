const keystone = require('keystone')
const moment = require('moment')
const monthlyClicksCsv = require('../../redshift/financeMonthEnd').monthlyClicksCsv

exports.screen = (req, res) => {
  var view = new keystone.View(req, res)
  view.render('clickReport')
}

exports.download = async (req, res) => {
  let fromDate = req.body.fromdate
  let toDate = req.body.todate
	toDate = moment(toDate).add(1, 'days').format('YYYY-MM-DD')
  let csv = await monthlyClicksCsv(fromDate, toDate)
  let fileName = `click-report-${fromDate}---${toDate}.csv`
  res.set({'Content-Disposition': `attachment; filename= ${fileName}`})
  res.set('Content-Type', 'text/csv')
  res.status(200).send(csv)
}
