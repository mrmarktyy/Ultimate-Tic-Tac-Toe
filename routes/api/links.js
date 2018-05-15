const keystone = require('keystone')
const Pages = keystone.list('Pages')
const Link = keystone.list('Link')
const _ = require('lodash')

exports.add = async function (req, res) {
	const pages = req.body.data
	try {
		for (let page of pages) {
			const url = Object.keys(page)[0]
			const pageModel = await Pages.model.findOne({url}).populate('links').lean().exec()
			const links = page[url]
			const pageLinks = pageModel.links || []
			const ids = _.map(pageLinks, '_id')
			for (link of links) {
				const checkLinkExist = _.find(pageLinks, {name: link.name, page: pageModel._id})
				if (!checkLinkExist) {
					link.page = pageModel._id
					const newLink = new Link.model(link)
					const data = await newLink.save()
					if (data && data._id) {
						ids.push(data._id)
					}
				}
			}
			Pages.model.findOneAndUpdate({_id: pageModel._id}, {$set: {links: ids}}).exec()
		}
		res.status(200).jsonp({success: "Links added successfully"})
	} catch (err) {
		res.status(400).jsonp({error: err.message})
	}
}

exports.update = async function (req, res) {
	const pages = req.body.data
	try {
		for (let page of pages) {
			const url = Object.keys(page)[0]
			const pageModel = await Pages.model.findOne({url}).populate('links').lean().exec()
			const links = page[url]
			const pageLinks = pageModel.links || []
			for (link of links) {
				const checkLinkExist = _.find(pageLinks, {name: link.name, page: pageModel._id})
				if (checkLinkExist) {
					await Link.model.findOneAndUpdate({name: link.name, page: pageModel._id}, {$set: link}).exec()
				}
			}
		}
		res.status(200).jsonp({success: "Links updated successfully"})
	} catch (err) {
		res.status(400).jsonp({error: err.message})
	}
}

exports.delete = async function (req, res) {
	const pages = req.body.data
	try {
		for (let page of pages) {
			const url = Object.keys(page)[0]
			const pageModel = await Pages.model.findOne({url}).populate('links').lean().exec()
			const links = page[url]
			const pageLinks = pageModel.links || []
			let ids = _.map(pageLinks, '_id');
			for (link of links) {
				const checkLinkExist = _.find(pageLinks, {name: link.name, page: pageModel._id})
				if (checkLinkExist) {
					const linkData = await Link.model.findOne({name: link.name, page: pageModel._id}).exec()
					if (linkData) {
						const index = ids.indexOf(linkData._id);
						ids.splice(index, 1);
						await Link.model.remove({name: link.name, page: pageModel._id}).exec()
					}
				}
			}
			Pages.model.findOneAndUpdate({_id: pageModel._id}, {$set: {links: ids}}).exec()
		}
		res.status(200).jsonp({success: "Links deleted successfully"})
	} catch (err) {
		res.status(400).jsonp({error: err.message})
	}
}

