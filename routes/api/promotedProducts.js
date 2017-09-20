var keystone = require('keystone')
var PromotedProducts = keystone.list('PromotedProduct')

exports.list = async function (req, res) {
	const datenow = new Date()
	let products = await PromotedProducts.model.find({
		$or: [
			{dateStart: {$lte: datenow}, dateEnd: null},
			{dateStart: {$lte: datenow}, dateEnd: {$gte: datenow}},
		]
	}).populate('company').lean().exec()
	res.jsonp(products)
}

