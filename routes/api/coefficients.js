var keystone = require('keystone')
var Coefficients = keystone.list('Coefficient')
var removeUneededFields = require('../../utils/removeUneededFields')

exports.list = async function (req, res) {
	let coeff = await Coefficients.model.find().lean().exec()

	coeff = coeff.map((item) => removeUneededFields(item))
	res.jsonp(coeff)
}
