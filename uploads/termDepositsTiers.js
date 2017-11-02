require('dotenv').config()
var path = require('path')
const _ = require('lodash')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var csvToJson = require('../utils/csvToJson')
var logger = require('../utils/logger')

const csvFilePath = path.join(__dirname, './tmp/termDepositsTier.csv')
const termDepositsTiers = keystoneShell.list('TermDepositTier')
const company = keystoneShell.list('Company')
const termDeposits = keystoneShell.list('TermDeposit')

module.exports = async function () {
	let connection = await mongoosePromise.connect()
	try {
		let data = await csvToJson(csvFilePath)
		for (let item of data) {
			let obj = {}
			//store company data
			const companyData = await company.model.findOne({
				$or: [
					{name: {$regex: new RegExp(`^${item.company}$`, 'i')}},
					{displayName: {$regex: new RegExp(`^${item.company}$`, 'i')}},
					{shortName: {$regex: new RegExp(`^${item.company}$`, 'i')}},
					{otherNames: {$regex: new RegExp(`^${item.company}$`, 'i')}},
				]
			}).exec()
			obj.company = companyData && companyData._id

			//store product data
			const productData = await termDeposits.model.findOne({uuid: item.productUUID}).exec()
			obj.product = productData && productData._id
			obj.minimumDeposit = item.minimumDeposit && parseInt(item.minimumDeposit)
			obj.maximumDeposit = item.maximumDeposit && parseInt(item.maximumDeposit)
			obj.interestPaymentFrequencyShortTerm = item.interestPayableShortTerm && item.interestPayableShortTerm.toLowerCase()
			obj.interestPaymentFrequencyLongTerm = item.interestPayableLongTerm && item.interestPayableLongTerm.toLowerCase()
			obj.interestCalculationFrequency = item.interestCalculationFrequency && item.interestCalculationFrequency.toLowerCase()


			const termVariations = []
			Object.keys(item).filter(termVariation => /(\d|\d\d)-(month|months)-rate/g.test(termVariation) && item.name).
			reduce((prevVariation, currVariation, index ,arr) => {
				const termVariation = Object.assign({}, obj)
				const term = currVariation.split('-')
				termVariation.name = `${item.name} - ${term[0]} ${term[1]}`
				termVariation.maximumTerm = term[0] && parseInt(term[0])
				termVariation.minimumTerm = prevVariation.minimumTerm || termVariation.maximumTerm
				termVariation.interestRate = item[currVariation] && parseFloat(item[currVariation])
				if(prevVariation.interestRate !== termVariation.interestRate && index){
					termVariation.minimumTerm = termVariation.maximumTerm
					termVariations.push(prevVariation)
				}
				if(index === arr.length-1){
					termVariations.push(termVariation)
				}
				return termVariation
			}, {})

			for (terms of termVariations) {
				const termVariation = Object.assign({}, obj)
				if (terms.product) {
					let termDepositsTier = new termDepositsTiers.model(terms)
					await termDepositsTier.save(err => {
						if (err) {
							logger.error(err)
						}
					})
				}

			}
		}
		connection.close()
	} catch (error) {
		logger.error(error)
		return error
	}
}()
