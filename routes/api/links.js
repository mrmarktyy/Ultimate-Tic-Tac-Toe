var keystone = require('keystone')
var Pages = keystone.list('Pages')
var Link = keystone.list('Link')
const _ = require('lodash')

module.exports = async function (req, res) {
	const pages = req.body.data
	try {
		for (let page of pages){
			const url = Object.keys(page)[0]
			const links = page[url]
			await addOrUpdateUrl(url, links)
		}
		res.jsonp({success: "Pages updated successfully"})
	}catch(error){
		res.jsonp({error: error.message})
	}
}

async function addOrUpdateUrl(url, links) {
	let page = await Pages.model.findOne({url }).populate('links').lean().exec()
	const pageLinks = page.links || []
	const ids = _.map(pageLinks, '_id')
	for (link of links){
		const checkLink = _.find(pageLinks, link)
		if(!checkLink) {
			const newLink = new Link.model(link)
			const data = await newLink.save()
			if(data && data._id){
				ids.push(data._id)
			}
		}
	}
  return await Pages.model.findOneAndUpdate({_id: page._id}, {$set: {links: ids}}).exec()
}
