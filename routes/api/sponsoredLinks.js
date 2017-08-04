var keystone = require('keystone')
var SponsoredLink = keystone.list('SponsoredLink')

exports.list = async function (req, res) {
	let sponsoredLinks = await SponsoredLink.model.find().populate('company').lean().exec()
	sponsoredLinks = sponsoredLinks.map((link) => {
		let company = Object.assign({}, link.company)
		link.title = link.name
		company.logo = company.logo && company.logo.url
		link.company = company
		link.imageUrl = link.imageUrl && link.imageUrl.filename
		return link
	})
	res.jsonp(sponsoredLinks)
}

