require('dotenv').config()
const keystoneShell = require('../../utils/keystoneShell')
const mongoosePromise = require('../../utils/mongoosePromise')
const logger = require('../../utils/logger/index')
const bankAccounts = keystoneShell.list('BankAccount')

module.exports = async function () {
	let connection = await mongoosePromise.connect()
	try {
		const bankAccountData = await bankAccounts.model.find({
			smartPaySupport: "Android Pay"
		}).exec()

		for (let account of bankAccountData) {
			const smartPaySupport = account.smartPaySupport.slice()
			const index = smartPaySupport.indexOf('Android Pay')
			smartPaySupport[index] = 'Google Pay'
			account.smartPaySupport = smartPaySupport
			await account.save((err, data) => {
				if (err) {
					logger.error(err)
				}
			})
		}
		connection.close()
	} catch (error) {
		logger.error(error)
		return error
	}
}()
