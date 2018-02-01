const keystone = require('keystone')
const csvtojson = require('../../utils/csvToJson')
const keystoneUpdate = require('../../utils/helperFunctions').keystoneUpdate

exports.screen =  (req, res) => {
	let view = new keystone.View(req, res)
	let locals = res.locals
	locals.section = 'pages'
	view.render('importPages')
}

exports.uploadFile =  async (req, res) => {
	try {
		if (Object.keys(req.files).length === 0) {
			throw 'No upload file is specified'
		}
		let pages = await csvtojson(req.files.pageUpload.path)
		await updatePages(pages, req)
		req.flash('success', 'Pages has been updated successfully')
		return res.redirect('/import-pages')
	} catch (error) {
		req.flash('error', error)
		return res.redirect('/import-pages')
	}
}

async function updatePages(pages, req) {
	try {
		const pagesModel = keystone.list('Pages')
		pages.forEach(async(page) => {
			try {
				page.category = JSON.parse(page.category)
				page.vertial = page.vertial || 'default'
			}catch (e){}
			if (page.url) {
				let pageData = await pagesModel.model.findOne({'url': page.url}).exec()
				if(!pageData){
					pageData = new pagesModel.model()
				}
				pageData.set(page)
				await keystoneUpdate(pageData, req)
			}
		})
	} catch (error) {
		throw(error)
	}
}
