exports.setPromotedOrder = function (product) {
	product.promotedOrder = product.promotedOrder === '0' ? null : 100 - parseInt(product.promotedOrder)
}

exports.keystoneUpdate = function (model, req) {
	let updateHandler = model.getUpdateHandler(req)
	return new Promise((resolve, reject) => {
		updateHandler.process(model, (err) => {
			if (err) {
				console.log(err);
				reject('UUID: ' + model.uuid + 'Error:' + err.detail)
			} else {
				resolve()
			}
		})
	})
}
