var keystone = require('keystone')
var BlacklistUser = keystone.list('BlacklistUser')
var logger = require('../../utils/logger')

exports.list = async function (req, res) {
	var blacklistedUsers = await BlacklistUser.model.find()
		.lean()
		.exec((err, users) => {
			if (err) {
				logger.error(`database error on api fetching blacklisted users`)
				return 'database error'
			}
			return users
		})
	res.send(blacklistedUsers)
}
