require('dotenv').config()

var keystone = require('keystone')
const _ = require('lodash')
var path = require('path')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var csvToJson = require('../utils/csvToJson')
var logger = require('../utils/logger')
var utils = keystone.utils

const csvFilePath = path.join(__dirname, './tmp/termDepositsCompanies.csv')
const termDepositsCompany = keystoneShell.list('TermDepositCompany')
const company = keystoneShell.list('Company')

module.exports = async function () {
	let connection = await mongoosePromise.connect()
	try {
		const data = await csvToJson(csvFilePath)
		for (let item of data) {
			let obj = {}


			const companyData = await company.model.findOne({slug: item.Slug}).exec()
			obj.blurb = item.Blurb
			obj.company = companyData && companyData._id
			let termDepositsCompanyData = new termDepositsCompany.model(obj)

			await termDepositsCompanyData.save(err => {
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
