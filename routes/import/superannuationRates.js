const keystone = require('keystone')
const utils = keystone.utils
const changeCase = require('change-case')
const _ = require('lodash')
const logger = require('../../utils/logger')
const csvtojson = require('../../utils/csvToJson')
const uuid = require('node-uuid')

const { fields } = require('../../models/superannuation/constants')
const Superannuation = keystone.list('Superannuation')
const FundGroup = keystone.list('FundGroup')

exports.uploadCsv = async (req, res) => {
	try {
		if (Object.keys(req.files).length === 0) {
			throw 'No upload file is specified'
		}
		const list = await csvtojson(req.files.superannuationFileUpload.path)
		const type = req.body.type || 'Superannuation'
		const fy = req.body.fy || new Date().getFullYear()
		const month = req.body.month || 1
		await upsertSuperannuation(list, {type, fy, month})
		req.flash('success', 'Import successfully.')
		return res.redirect('/import-rates')
	} catch (error) {
		req.flash('error', error)
		return res.redirect('/import-rates')
	}
}

async function upsertSuperannuation (list, {type, fy, month}) {
	try {
		const promises = []
		const newProductIds = []
		const allProducts = await Superannuation.model.find(type === 'Superannuation' ? {superannuation: true} : {pension: true}).exec()

		for (let i = 0; i < list.length; i++) {
			if (_.isNaN(parseInt(list[i].PRODUCT_ID, 10))) {
				continue
			}
			const product = extractFields(list[i])
			let superannuation = await Superannuation.model.findOne({product_id: product.product_id}).exec()
			if (superannuation) {
				_.merge(superannuation, product)
			} else {
				superannuation = new Superannuation.model(product)
				superannuation.pension = type === 'Pension'
				superannuation.superannuation = type === 'Superannuation'
			}
			superannuation.name = product.product_name
			superannuation.fy = fy
			superannuation.month = month
			superannuation.isDiscontinued = false
			newProductIds.push(product.product_id)

			let fundGroup = await FundGroup.model.findOne({groupCode: superannuation.group_code}, '_id').exec()
			if (!fundGroup) {
				await new FundGroup.model({
					slug: utils.slug(superannuation.fund_name.toLowerCase()),
					uuid: uuid.v4(),
					name: superannuation.short_name,
					fundName: superannuation.fund_name,
					groupName: superannuation.group_name,
					groupCode: superannuation.group_code,
					phoneNumber: superannuation.phone_number,
					website: superannuation.website,
				}).save((err, fund) => {
					if (err || !fund) {
						logger.error(err)
						return
					}
					fundGroup = fund
				})
			}

			if (fundGroup) {
				superannuation.fundgroup = fundGroup._id
			}

			promises.push(
				superannuation.save((err) => {
					if (err) {
						logger.error(err)
					}
				})
			)
		}

		if (newProductIds.length === 0) {
			return
		}

		_.remove(allProducts, (product) => !newProductIds.includes(product.product_id))
			.forEach((product) => {
				product.isDiscontinued = true
				promises.push(
					product.save((err) => {
						if (err) {
							logger.error(err)
						}
					})
				)
			})
		await Promise.all(promises)
	} catch (err) {
		logger.error(err)
		throw err
	}
}

function extractFields (item) {
	const product = {}
	const data = _.transform(item, (result, value, key) => {
		result[changeCase.snakeCase(key)] = value
	})
	_.forIn(fields, (value, key) => {
		product[value] = (data[key] || '').replace(/[\r\n]/g, '') || product[value] || ''
	})
	return product
}
