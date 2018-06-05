const keystone = require('keystone')
const Pages = keystone.list('Pages')
const Link = keystone.list('Link')
const _ = require('lodash')

module.exports = async function (req, res) {
	const pages = req.body.data
	const urls = Object.keys(pages)
	try {
		for (let url of urls) {
			const pageModel = await Pages.model.findOne({url}).populate('links').lean().exec()
			const links = pages[url]
			const pageLinks = pageModel.links || []
			await removeLinksIfPresent(pageLinks)
			const ids = []
			for (link of links) {
				link.page = pageModel._id
				const newLink = new Link.model(link)
				const data = await newLink.save()
				if (data && data._id) {
					ids.push(data._id)
				}
			}
			Pages.model.findOneAndUpdate({_id: pageModel._id}, {$set: {links: ids}}).exec()
		}
		res.status(200).jsonp({success: 'Links updated successfully'})
	} catch (err) {
		res.status(400).jsonp({error: 'Error in updating links'})
	}
}

async function removeLinksIfPresent (links){
	for (id of _.map(links, '_id')) {
		await Link.model.findByIdAndRemove({_id: id}).exec()
	}
}
