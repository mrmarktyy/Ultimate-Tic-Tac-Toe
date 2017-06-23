var keystone = require('keystone')
var logger = require('../../utils/logger')
var Broker = keystone.list('Broker')

exports.list = async function (req, res) {
	let brokers = await Broker.model.find().populate('tiles testimonials companies').lean().exec()
	res.jsonp(brokers)
}

