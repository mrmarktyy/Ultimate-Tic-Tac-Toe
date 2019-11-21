var mongoose = require('mongoose')
const fetch = require('node-fetch')
module.exports = async function (model, options={}) {
	let { urls = [], isDiscontinued, urlPrefix } = options
	if(!urls.length) {
		let collectionName = model.constructor.modelName
		let Model = mongoose.model(collectionName)
		const product = await Model.findOne({uuid: model.uuid}).populate('company').lean().exec()
		if(product && product.isDiscontinued != model.isDiscontinued) {
			urls.push(`${urlPrefix}/${product.company.slug}/${product.slug}`)
			isDiscontinued = model.isDiscontinued
		}
	}
	if(urls.length && typeof isDiscontinued === 'boolean') {
		const host = process.env.CONTENT_HOST ? process.env.CONTENT_HOST : 'http://localhost:4400'
		const body = {
			urls,
			status: isDiscontinued ? 'draft' : 'published',
		}
		fetch(`${host}/api/update-page-status`, {
			method: 'put',
			body: JSON.stringify(body),
			headers: {'Content-Type': 'application/json'},
		})
		.then(res => res.json())
		.then(json => {
			console.log(json)
		})
	}
	return model
}
