const keystone = require('keystone')
const moment = require('moment')
const leadsCsv = require('../../redshift/leadsData').leadsCsv
const Broker = keystone.list('Broker')

exports.screen = async (req, res) => {
	let view = new keystone.View(req, res)
	var locals = res.locals
	locals.section = 'home'
	let dateComponents = moment().format('YYYY MMMM').split(' ')
	locals.currentYear = dateComponents[0]
	locals.currentMonth = dateComponents[1]
	locals.years = [parseInt(locals.currentYear), parseInt(locals.currentYear) - 1]
	locals.months = moment().localeData().months()
	view.on('init', async (next) => {
		let brokers = await Broker.model.find().exec()
		locals.brokers = brokers
		next()
	})
	view.render('exportLeads')
}

exports.download = async (req, res) => {
	let broker = req.body.broker
	let month = req.body.month
	let year = req.body.year
	let csv = await leadsCsv(broker, month, year)
	let fileName = `monthly-leads-${month}-${broker}.csv`
	res.set({'Content-Disposition': `attachment; filename= ${fileName}`})
	res.set('Content-Type', 'text/csv')
	res.status(200).send(csv)
}
