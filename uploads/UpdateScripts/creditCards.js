require('dotenv').config()
const keystoneShell = require('../../utils/keystoneShell')
const mongoosePromise = require('../../utils/mongoosePromise')
const logger = require('../../utils/logger/index')
const creditCards = keystoneShell.list('CreditCard')

module.exports = async function () {
	let connection = await mongoosePromise.connect()
	try {
		const creditCardsData = await creditCards.model.find(
			{
				androidPayAvailable: {$exists: true}
			}).exec()

		const removeAndroidPay = process.argv[2] === 'removeAndroidPayKey'

		for (let card of creditCardsData) {
			if (removeAndroidPay) {
				card.set('androidPayAvailable', undefined, {strict: false})
			} else {
				card.googlePayAvailable = card.toJSON().androidPayAvailable
			}
			await card.save((err, data) => {
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


