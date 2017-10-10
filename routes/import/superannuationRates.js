const keystone = require('keystone')
const changeCase = require('change-case')
const _ = require('lodash')
const fetch = require('node-fetch')
const logger = require('../../utils/logger')
const csvtojson = require('../../utils/csvToJson')

const fields = require('../../models/superannuation/constants').fields
const Superannuation = keystone.list('Superannuation')
const FundGroup = keystone.list('FundGroup')

exports.uploadCsv = async (req, res) => {
	try {
		if (Object.keys(req.files).length === 0) {
			throw 'No upload file is specified'
		}
		const list = await csvtojson(req.files.superannuationFileUpload.path)
		const fenixJSON = await fetch('http://www.ratecity.com.au/api/money-saver/superannuation/blaze.json')
		const fenixProducts = await fenixJSON.json()
		await upsertSuperannuation(list, fenixProducts)
		req.flash('success', 'Import successfully.')
		return res.redirect('/import-rates')
	} catch (error) {
		req.flash('error', error)
		return res.redirect('/import-rates')
	}
}

async function upsertSuperannuation (list, fenixProducts) {
	try {
		const promises = []

		for (let i = 0; i < list.length; i++) {
			if (_.isNaN(parseInt(list[i].PRODUCT_ID, 10))) {
				continue
			}
			const product = extractFields(list[i])
			const fenixProduct = findProduct(product.product_id, fenixProducts)
			let superannuation = await Superannuation.model.findOne({product_id: product.product_id}).exec()
			if (superannuation) {
				_.merge(superannuation, product)
			} else {
				superannuation = new Superannuation.model(product)
			}

			superannuation.name = product.product_name
			superannuation.slug = fenixProduct.product_slug
			superannuation.fenixLogo = fenixProduct.logo

			let fundGroup = await FundGroup.model.findOne({groupCode: superannuation.group_code}, '_id')
			if (!fundGroup) {
				await new FundGroup.model({
					uuid: fenixProduct.company.company_uuid,
					slug: fenixProduct.company.slug,
					name: superannuation.short_name,
					type: fenixProduct.company.company_type,
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
				superannuation.company = fundGroup._id
			}

			promises.push(
				superannuation.save((err) => {
					if (err) {
						logger.error(err)
					}
				})
			)
		}
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
		product[value] = (data[key] || '').replace(/[\r\n]/g, '')
	})
	return product
}

function findProduct (id, products) {
	return _.find(products, {supplier_reference: id}) || {company: {}}
}