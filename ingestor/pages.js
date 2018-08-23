require('dotenv').config()
var fetch = require('node-fetch')
const _ = require('lodash')
const changeCase = require('change-case')
const async = require('async')
const uuid = require('node-uuid')
var keystoneShell = require('../utils/keystoneShell')
const mongoosePromise = require('../utils/mongoosePromise')
const Pages = keystoneShell.list('Pages')
const verticals = [...require('../models/helpers/verticals'), {value: 'nonspecific', label: 'Non Specific'}]

module.exports = async function () {
	let connection = await mongoosePromise.connect()
	try {
		const pages = await fetchPages(`${process.env.RATECITY_PAGE_API}?page=1&per_page=9000&showAll=true`)
		await updateUltimatePages(pages.hits)
	} catch (error) {
		console.log('Error: ', error)
	}
	connection.close()
}

async function updateUltimatePages (pages) {
	return new Promise((resolve, reject) => {
		async.mapLimit(pages, 15, async function (page, cb) {
			try {
				let resolvedPage = {...page.page, ...page}
				const vertical = resolvedPage.vertical && verticals.find(({value, label}) => resolvedPage.vertical.toLowerCase() === value.toLowerCase() || resolvedPage.vertical.toLowerCase() === label.toLowerCase())
				const isCompanyPage = resolvedPage.variant === 'Company' || resolvedPage.variant === 'Companies'
				if (isCompanyPage || vertical) {
					if (_.isEmpty(resolvedPage.keywords)) {
						const url = resolvedPage.url
						resolvedPage.keywords = _.lowerCase(url.replace(/\/|-/g, ' '))
					}
					if (resolvedPage.variant === 'Whitelabel Search') {
						resolvedPage.ignoreSeoOptimisation = true
					}
					if (!resolvedPage.popularSearchTitle) {
						resolvedPage.popularSearchTitle = changeCase.titleCase(resolvedPage.url)
					}
					resolvedPage.vertical = isCompanyPage ? 'default' : vertical.value
					await insertPage(resolvedPage)
				}
			} catch (e) {
				console.log(e)
			}
			return
		}, (err) => {
			if (err) {
				console.log(err)
				reject()
			}
			resolve()
		})
	})
}

async function fetchPages (url) {
	const response = await fetch(url, {
		method: 'GET',
	})
	if (response.status !== 200) {
		console.log(`${url} returned status: ${response.status}`)
		return null
	}
	return await response.json()
}

async function insertPage (page) {
	let pagesData = await Pages.model.findOne({'url': page.url}).exec()
	if (!pagesData) {
		process.stdout.write('New Page: ' + page.url + '\r')
		page.uuid = uuid.v4()
		pagesData = new Pages.model(page)
		return await pagesData.save()
	}
	return
}
