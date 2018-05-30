var keystone = require('keystone')
var Broker = keystone.list('Broker')
var CompanyService = require('../../services/CompanyService')

exports.list = async function (req, res) {
	let brokers = await Broker.model.find({$or: [{isDiscontinued: false}, {isDiscontinued: {$exists: false}}]}).populate('tiles testimonials companies').lean().exec()
	brokers = brokers.map((broker) => {
		broker.logo = broker.logo && fixUrl(broker.logo.url)
		broker.imageHeader = broker.imageHeader && broker.imageHeader.url
		if (broker.companies) {
			broker.companies = broker.companies.map((company) => CompanyService.fixLogoUrl(company))
		}
		broker.tiles.map(tile => {
			tile.icon = fixUrl(tile.icon)
			return tile
		})
		return broker
	})
	res.jsonp(brokers)
}

function fixUrl(url) {
	return url.replace('http://', '//')
}
