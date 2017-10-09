const keystone = require('keystone')
const csvtojson = require('../../utils/csvToJson')

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
		await updatePages(pages)
		req.flash('success', 'Pages has been updated successfully')
		return res.redirect('/import-pages')
	} catch (error) {
		req.flash('error', error)
		return res.redirect('/import-pages')
	}
}

async function updatePages(pages) {
	try {
		const pagesModel = keystone.list('Pages')
		pages.forEach(async(page) => {
			if (page.url) {
				await pagesModel.model.update({'url': page.url}, {$set: page}, {upsert: true});
			}
		})
	} catch (error) {
		throw(error)
	}
}
