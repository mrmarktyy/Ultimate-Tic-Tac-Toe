var keystone = require('keystone')
var Broker = keystone.list('Broker')

exports.list = async function (req, res) {
	let brokers = await Broker.model.find({ $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] }).populate('tiles testimonials companies').lean().exec()
	brokers = brokers.map((broker) => {
		broker.logo = broker.logo && broker.logo.url
    broker.imageHeader = broker.imageHeader && broker.imageHeader.url
		return broker
	})
	res.jsonp(brokers)
}

