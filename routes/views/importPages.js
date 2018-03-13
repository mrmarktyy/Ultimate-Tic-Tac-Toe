const keystone = require('keystone')
const csvtojson = require('../../utils/csvToJson')
const keystoneUpdate = require('../../utils/helperFunctions').keystoneUpdate
const checkCSVMissingHeader = require('../../utils/csv').checkCSVMissingHeader
const verticals = require('../../models/helpers/verticals')

exports.screen =  (req, res) => {
	let view = new keystone.View(req, res)
	let locals = res.locals
	locals.section = 'pages'
	view.render('importPages')
}

exports.uploadFile =  async (req, res) => {
	try {
		if (Object.keys(req.files).length === 0) {
			throw new Error('No upload file is specified')
		}
		const requiredFieldsMissing = await checkCSVMissingHeader(req.files.pageUpload.path, ['url'])
		if (requiredFieldsMissing) {
			throw new Error('url is missing in the provided csv')
		}
		let pages = await csvtojson(req.files.pageUpload.path)
		const errors = await updatePages(pages, req)
		if (errors.length) {
			errors.forEach((error) => {
				req.flash('warning', error)
			})
		}
		req.flash('success', 'Pages has been updated successfully')
		return res.redirect('/import-pages')
	} catch (error) {
		req.flash('error', error.message)
		return res.redirect('/import-pages')
	}
}

async function updatePages (pages, req) {
	const pagesModel = keystone.list('Pages')
	const errors = []
	pages.forEach(async (page, i) => {
		try {
			page.category = JSON.parse(page.category)
		} catch (e) {
			// swallow exception for now
		}
		const vertical = verticals.find(({ value, label }) => page.vertical.toLowerCase() === value.toLowerCase() || page.vertical.toLowerCase() === label.toLowerCase())
		if (!page.url) {
			errors.push(`product with row ${i+1} has missing url`)
			return
		}
		if (!vertical) {
			errors.push(`page details with url ${page.url} has an invalid vertical`)
			return
		}
		page.vertical = vertical.value
		let pageData = await pagesModel.model.findOne({'url': page.url}).exec()
		if (!pageData) { pageData = new pagesModel.model() }
		pageData.set(page)
		await keystoneUpdate(pageData, req)
	})
	return errors
}
