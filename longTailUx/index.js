require('dotenv').config()
var fetch = require('node-fetch')
const _ = require('lodash')
var keystoneShell = require('../utils/keystoneShell')
const mongoosePromise = require('../utils/mongoosePromise')
const Pages = keystoneShell.list('Pages')
const LongTailKeywords = keystoneShell.list('LongTailKeywords')

module.exports = async function () {
	let connection = await mongoosePromise.connect()
	try {
		const keywords = await fetchLongTailData(process.env.LONGTAIL_UX_KEYWORD_API)
		await updateUltimatePages(keywords.data)
	} catch (error) {
		console.log("Error: ", error)
	}
	connection.close()
}()

async function updateUltimatePages(keywords) {
	return await Promise.all(getDelayedPromises(keywords).map(async(keyword) => {
		const resolvedKeyword = await keyword
		const url = resolvedKeyword.attributes.url
		const longTailUxResponse =  url && await fetchLongTailData(`${process.env.LONGTAIL_UX_SEARCH_API}/${url}`)
		if (longTailUxResponse) {
			const longTailPageData = await processLongTailResponse(longTailUxResponse)
			await Pages.model.findOneAndUpdate({url}, {$set: longTailPageData}).exec()
		}
		return;
	}))
}

function getDelayedPromises(keywords) {
	return keywords.map(keyword => {
		return new Promise(function (resolve) {
			setTimeout(function () {
				return resolve(keyword);
			}, 100);
		});
	})
}
async function processLongTailResponse(response) {
	const searchData = response.data[0]
	const page = {longTailPopularSearches: [], longTailSimilarSearches: [], longTailArticles: []}
	const includedSearchData = response.included
	if (searchData) {
		const relationships = searchData.relationships
		page.longTailPopularSearches = await Promise.all(relationships.popular_searches.data.map(async(result) => {
			const id = result.id
			const includedData = _.find(includedSearchData, {id})
			const popularSearch = {id, ...includedData.attributes}
			const savedPopularSearch = await insertLongTailUxData(id, popularSearch)
			return savedPopularSearch._id
		}))

		page.longTailSimilarSearches = await Promise.all(relationships.similar_searches.data.map(async(result) => {
			const id = result.id
			const includedData = _.find(includedSearchData, {id})
			const similarSearch = {id, ...includedData.attributes}
			const savedSimilarSearch = await insertLongTailUxData(id, similarSearch)
			return savedSimilarSearch._id
		}))

		page.longTailArticles = await Promise.all(relationships.items.data.splice(0, 10).map(async(result) => {
			const id = result.id
			const includedData = _.find(includedSearchData, {id})
			const attributes = includedData.attributes
			let longTailArticle = {}
			try {
				longTailArticle = JSON.parse(attributes.item_attributes)
			} catch (e) {/** digest error for now **/
			}
			const article = {
				...{title: attributes.name, short_description: attributes.snippet},
				..._.pick(longTailArticle, ['author_image', 'thumbnail_image_url', 'created_at', 'author_name', 'readingTime']),
			}
			const articleData = {
				id,
				...attributes,
				article
			}
			const savedArticle = await insertLongTailUxData(id, articleData)
			return savedArticle._id
		}))
	}
	return page
}

async function fetchLongTailData(url) {
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: process.env.LONGTAIL_UX_API_KEY,
		},
	})
	if (response.status !== 200) {
		console.log(`${url} returned status: ${response.status}`)
		return null
	}
	return await response.json()
}

async function insertLongTailUxData(id, data) {
	const options = {
		upsert: true,
		new: true,
		setDefaultsOnInsert: true
	};
	return LongTailKeywords.model.findOneAndUpdate({longTailId: id}, data, options).exec()
}
