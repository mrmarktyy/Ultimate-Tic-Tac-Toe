var fetch = require('node-fetch')
var _ = require('lodash')
var logger = require('../utils/logger')

class SalesforceClient {
	constructor (username = process.env.SALESFORCE_USERNAME, password = process.env.SALESFORCE_PASSWORD, secret = process.env.SALESFORCE_SECRET, clientId = process.env.SALESFORCE_KEY) {
		this.username = username
		this.password = password
		this.clientId = clientId
		this.secret = secret
		this.maxRequestSize = 200
		this.authorization = null
	}
	getMax () {
		return this.maxRequestSize
	}
	async getAuthorization () {
		let authenticationBody = 'grant_type=password'
		authenticationBody += '&client_id=' + this.clientId
		authenticationBody += '&client_secret=' + this.secret
		authenticationBody += '&username=' + this.username
		authenticationBody += '&password=' + this.password

		try {
			const response = await fetch(process.env.SALESFORCE_LOGIN_URL, {
				method: 'POST',
				body: authenticationBody,
				headers: { 'Content-Type': 'application/x-www-form-urlencoded',
					'Accept': 'application/json',
				},
			})

			let jsonResponse = await response.json()
			if (jsonResponse.error) {
				throw jsonResponse.error_description
			}
			this.authorization = jsonResponse.token_type + ' ' + jsonResponse.access_token
			return this.authorization
		} catch (error) {
			logger.error(error)
			throw error
		}
	}
	async pushCompanies (allCompanies) {
		let status = 'ok'
		let companiesChunk = _.chunk(allCompanies, this.maxRequestSize)
		for (var chunk = 0; chunk < companiesChunk.length; chunk++) {
			let companiesLot = companiesChunk[chunk]
			let companiesBlock = []
			for (var lot = 0; lot < companiesLot.length; lot++) {
				companiesBlock.push({
					RC_Company_ID__c: companiesLot[lot].uuid,
					Name: companiesLot[lot].displayName || companiesLot[lot].name,
				})
			}
			let body = this.salesforcify({ acct: companiesBlock })
			let postings = await this.post(process.env.SALESFORCE_COMPANIES_URL, body) // eslint-disable-line babel/no-await-in-loop
			if (postings !== 200) {
				status = postings
			}
		}
		return status
	}
	async pushProducts (vertical, allProducts) {
		let status = 'ok'
		let productsChunk = _.chunk(allProducts, this.maxRequestSize)
		for (var chunk = 0; chunk < productsChunk.length; chunk++) {
			let productsLot = productsChunk[chunk]
			let productsBlock = []
			for (var lot = 0; lot < productsLot.length; lot++) {
				productsBlock.push({
					RC_Product_ID__c: productsLot[lot].uuid,
					RC_Product_Type__c: vertical,
					RC_Company_ID__c: productsLot[lot].company.uuid,
					RC_Product_Name__c: productsLot[lot].name.substring(0, 80),
					RC_Product_Visible__c: productsLot[lot].goToSite,
					RC_Product_Archived__c: false,
					RC_Product_Active__c: productsLot[lot].goToSite,
					RC_Product_Url__c: productsLot[lot].applyUrl,
				})
			}
			let body = this.salesforcify({ product: productsBlock })
			let postings = await this.post(process.env.SALESFORCE_PRODUCTS_URL, body) // eslint-disable-line babel/no-await-in-loop
			if (!postings) {
				status = postings
			}
		}
		return status
	}
	async post (url, attributes) {
		try {
			let response = await fetch(url, {
				method: 'POST',
				body: JSON.stringify(attributes),
				headers: {
					'Content-Type': 'application/json',
					'Authorization': await (this.getAuthorization()),
					'Accept': 'application/json',
				},
			})
			if (response.status !== 200) {
				let salesforceError = 'Salesforce ' + url + ' responded with ' + response.status
				throw salesforceError
			}
			return 200
		} catch (error) {
			logger.error(error)
			return error
		}
	}
	salesforcify (map) {
		return ({ data: map })
	}
}

module.exports = SalesforceClient
