var keystone = require('keystone')
var PromotedProducts = keystone.list('PromotedProduct')
var removeUneededFields = require('../../utils/removeUneededFields')
var MonetizeProduct = keystone.list('Monetize')

exports.list = async function (req, res) {
	const datenow = new Date()
	let products = await PromotedProducts.model.find({
		$or: [
			{dateStart: {$lte: datenow}, dateEnd: null},
			{dateStart: {$lte: datenow}, dateEnd: {$gte: datenow}},
		]
	}).populate('company').lean().exec()

	const monetizedProducts = await MonetizeProduct.model.find({ enabled: true }).lean().exec()
	products = products.map((product) => {
		product.company = {
			uuid: product.company.uuid,
			name: product.company.name,
			slug: product.company.slug,
			logo: product.company.logo.url
		}

		const monetized = monetizedProducts.find((item) => item.uuid === product.uuid)
		if (monetized) {
			product.monetized = true
		} else {
			product.monetized = false
		}

		return removeUneededFields(product)
	})
	res.jsonp(products)
}
