var keystone = require('keystone')
var Pages = keystone.list('Pages')

exports.list = async function (req, res) {
	const condition = {}
	if (req.query.url) {
		condition.url = req.query.url
	}
	let pages = await Pages.model.find(condition, {_id: 0}).lean().exec()
	res.jsonp(pages)
}

