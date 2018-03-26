var keystone = require('keystone')
var SponsoredLink = keystone.list('SponsoredLink')
const CompanyService = require('../../services/CompanyService')

exports.list = async function (req, res) {
	let sponsoredLinks = await SponsoredLink.model.find().populate('company').lean().exec()
	sponsoredLinks = sponsoredLinks.map((link) => {
		const company = CompanyService.fixLogoUrl(Object.assign({}, link.company))
		company.logo = company.logo && company.logo.url
		link.title = link.name
		link.company = company
		link.imageUrl = link.imageUrl && link.imageUrl.url
		return link
	})
	res.jsonp(sponsoredLinks)
}

