var keystone = require('keystone')
var PromotedProducts = keystone.list('PromotedProduct')
var removeUneededFields = require('../../utils/removeUneededFields')

exports.list = async function (req, res) {
	const datenow = new Date()
	let products = await PromotedProducts.model.find({
		$or: [
			{dateStart: {$lte: datenow}, dateEnd: null},
			{dateStart: {$lte: datenow}, dateEnd: {$gte: datenow}},
		]
	}).populate('company').lean().exec()

	products = products.map((product) => {
		product.company = {
			uuid: product.company.uuid,
			name: product.company.name,
			slug: product.company.slug,
			logo: product.company.logo.url
		}

		return removeUneededFields(product)
	})
	res.jsonp(products)
}
