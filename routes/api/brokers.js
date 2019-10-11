var keystone = require('keystone')
var Broker = keystone.list('Broker')
var CompanyService = require('../../services/CompanyService')

const verticalModelMapping = {
	'home-loans': 'HomeLoan',
	'personal-loans': 'PersonalLoan',
	'car-loans': 'PersonalLoan',
	'superannuations': 'Superannuation',
	'credit-cards': 'CreditCard',
	'term-deposits': 'TermDeposit',
	'bank-accounts': 'BankAccount',
	'savings-accounts': 'SavingsAccount'
}
exports.list = async function (req, res) {
	let brokers = await Broker.model.find({$or: [{isDiscontinued: false}, {isDiscontinued: {$exists: false}}]}).populate('tiles testimonials companies').lean().exec()

	await Promise.all(brokers.map(async (broker) => {
		broker.logo = broker.logo && fixUrl(broker.logo.url)
		broker.imageHeader = broker.imageHeader && broker.imageHeader.url
		broker.photo = broker.photo && broker.photo.url
		if (broker.companies) {
			broker.companies = broker.companies.map((company) => CompanyService.fixLogoUrl(company))
		}
		if (broker.backgroundImage) {
			broker.backgroundImage.url = broker.backgroundImage.url.replace('http://res.cloudinary.com/ratecity/image/upload', '//production-ultimate-assets.ratecity.com.au/ratecity/image/upload/f_auto')
		}
		if (broker.guideImageHeader) {
			broker.guideImageHeader.url = broker.guideImageHeader.url.replace('http://res.cloudinary.com/ratecity/image/upload', '//production-ultimate-assets.ratecity.com.au/ratecity/image/upload/f_auto')
		}
		broker.tiles = fixUrls(broker.tiles, 'icon')
		broker.testimonials = fixUrls(broker.testimonials, 'href')
		if(broker.useProductUUID && broker.productUUID) {
			let productDetail = await keystone.list(verticalModelMapping[broker.vertical]).model.findOne({ uuid: broker.productUUID }, {name: 1, uuid: 1, _id: 0}).lean().exec()
			broker.defaultProduct = {
				...productDetail
			};
		}
		return broker
	}));

	res.jsonp(brokers)
}

function fixUrls (attributes, field, url) {
	return attributes.map((attribute) => {
		attribute[field] = fixUrl(attribute[field])
		return attribute
	})
}

function fixUrl (url) {
	var regex = new RegExp('^(http|https):', 'i')
	return url.replace(regex, '')
}
