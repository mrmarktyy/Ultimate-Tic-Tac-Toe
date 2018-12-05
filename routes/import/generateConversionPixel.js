const keystone = require('keystone')
const fetch = require('node-fetch')
const moment = require('moment')
const _ = require('lodash')

const logger = require('../../utils/logger')
const awsDownloadFromS3 = require('../../utils/awsDownloadFromS3')
const Mailer = require('../../utils/mailer')
const Company = keystone.list('Company')
const filePath = '/tmp/'

exports = module.exports = async(req, res) => {
	try {
		let companyUuid = req.body.companyName
		let company = await Company.model.findOne({uuid: companyUuid}).exec()
		const email = res.locals.user.email
		if (company.uuid && company.userHasOffers) {
			const companyName = company.name || company.displayName
			const offers = await fetchOffers()
			const offer = offers && _.find(offers, {companyUUID: company.uuid})
			if (offer) {
				const response = await createConversionPixel(offer.generateConversionPixels)
				logger.info(response)
				const path = await downloadPixelReport(offer.companyName)
				await emailLoggedInUser(email, path, offer.companyName)
			}
			req.flash('success', 'Email containing conversion pixel report has been sent to your email id')
		}else{
			req.flash('error', 'company not found')
		}
		return res.redirect('/generate-conversion-pixel')
	} catch (error) {
		logger.error(error)
		req.flash('error', error.message)
		return res.redirect('/generate-conversion-pixel')
	}
}

async function fetchOffers() {
	const request = await fetch(process.env.HASOFFERS_GENERATE_API_URL)
	const offersResponse = await request.json()
	return offersResponse.data
}

async function createConversionPixel(url) {
	const request = await fetch(url)
	const offersResponse = await request.json()
	return offersResponse
}

async function downloadPixelReport(companyName) {
	const fileName = `hasoffers/conversion_pixels_${companyName}.csv`
	const bucketName = 'rc-tracker'
	const path = `${filePath}conversion_pixels_${companyName}.csv`
	await awsDownloadFromS3(bucketName, fileName, path)
	return path
}

async function emailLoggedInUser(to, path, companyName) {
	const attachments = [{path}]
	let dt = moment().format('DD-MMM-YYYY')
	let mailer = new Mailer({
		to,
		attachments,
		subject: `Conversion Pixel Report for ${companyName} ${dt}`,
		cc: 'ian.fletcher@ratecity.com.au',
	})
	await mailer.sendEmail()
}
