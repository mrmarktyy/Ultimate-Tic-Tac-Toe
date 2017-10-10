var keystone = require('keystone')
var Pages = keystone.list('Pages')

exports.list = async function (req, res) {
	let pages = await Pages.model.find({}, {_id: 0}).lean().exec()
	res.jsonp(pages)
}

