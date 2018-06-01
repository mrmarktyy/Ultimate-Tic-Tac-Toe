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
		broker.tiles = fixUrls(broker.tiles, 'icon')
		broker.testimonials = fixUrls(broker.testimonials, 'href')
		return broker
	})
	res.jsonp(brokers)
}

function fixUrls(attributes, field, url) {
	return attributes.map(attribute => {
		attribute[field] = fixUrl(attribute[field])
		return attribute
	})
}

function fixUrl(url) {
	var regex = new RegExp("^(http|https):", "i");
	return url.replace(regex, '')
}
