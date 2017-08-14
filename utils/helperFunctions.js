exports.setPromotedOrder = function(product) {
	product.promotedOrder = product.promotedOrder === '0' ? null : 100 - parseInt(product.promotedOrder)
}
