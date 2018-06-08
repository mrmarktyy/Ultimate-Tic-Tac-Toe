const keystone = require('keystone')
const leadsCsv = require('../../redshift/leadsData').leadsCsv
const moment = require('moment')
const Broker = keystone.list('Broker')

exports.screen = async (req, res) => {
	let view = new keystone.View(req, res)
	var locals = res.locals
	locals.section = 'home'
	view.on('init', async (next) => {
		let brokers = await Broker.model.find().exec()
		locals.brokers = brokers
		locals.brokers.unshift({name: 'All', slug: 'All'})
		next()
	})
	view.render('exportLeads')
}

exports.download = async (req, res) => {
	let broker = req.body.broker
	let fromDate = req.body.fromdate
	let toDate = req.body.todate
	toDate = moment(toDate).add(1, 'days').format('YYYY-MM-DD')
	let csv = await leadsCsv(broker, fromDate, toDate)
	let fileName = `monthly-leads-${fromDate}-${toDate}-${broker}.csv`
	res.set({'Content-Disposition': `attachment; filename= ${fileName}`})
	res.set('Content-Type', 'text/csv')
	res.status(200).send(csv)
}
