require('dotenv').config()
var fetch = require('node-fetch')
const _ = require('lodash')
const async = require('async')
const keystoneShell = require('../utils/keystoneShell')
const mongoosePromise = require('../utils/mongoosePromise')
const Pages = keystoneShell.list('Pages')
const LongTailKeywords = keystoneShell.list('LongTailKeywords')
let count = 0;

module.exports = async function () {
	let connection = await mongoosePromise.connect()
	try {
		const pages = []
		const keywords = await fetchLongTailPaginatedPage(pages)
		await updateUltimatePages(keywords)
	} catch (error)  {
		console.log("Error: ", error)
	}
	connection.close()
}

async function fetchLongTailPaginatedPage(pages) {
	let limit = 1000, offset = 0, totalPage = 0
	do {
		const keywords = await fetchLongTailData(`${process.env.LONGTAIL_UX_KEYWORD_API}?page%5Blimit%5D=${limit}&page%5Boffset%5D=${offset}`)
		pages.push(...keywords.data)
		totalPage = keywords.meta.total
		offset += keywords.data.length
	} while (pages.length < totalPage)
	console.log("Total Pages :", totalPage)
	return pages
}

async function updateUltimatePages(keywords) {
	return new Promise((resolve, reject) => {
		async.mapLimit(keywords, 15, async function (keyword, cb) {
			try {
				const url = keyword.attributes.url
				const longTailUxResponse = url && await fetchLongTailData(`${process.env.LONGTAIL_UX_SEARCH_API}${url}`)
				if (longTailUxResponse) {
					const longTailPageData = await processLongTailResponse(longTailUxResponse)
					count++
					process.stdout.write("Current Page: " + count + "\r");
					await Pages.model.findOneAndUpdate({url}, {$set: longTailPageData}).exec()
				}
			} catch (e) {
				console.log(e)
			}
			return;
		}, (err, results) => {
			if (err) {
				console.log(err);
				reject()
			}
			console.log('finished')
			resolve()
		})
	})
}

async function processLongTailResponse(response) {
	const searchData = response.data[0]
	const page = {longTailPopularSearches: [], longTailSimilarSearches: [], longTailArticles: [], longTailFaqs: []}
	const includedSearchData = response.included
	if (searchData) {
		const relationships = searchData.relationships
		page.longTailPopularSearches = await Promise.all(relationships.popular_searches.data.map(async(result) => {
			const id = result.id
			const includedData = _.find(includedSearchData, {id})
			const popularSearch = {longTailId: id, ...includedData.attributes}
			const savedPopularSearch = await insertLongTailUxData(popularSearch)
			return savedPopularSearch._id
		}))

		page.longTailSimilarSearches = await Promise.all(relationships.similar_searches.data.map(async(result) => {
			const id = result.id
			const includedData = _.find(includedSearchData, {id})
			const similarSearch = {longTailId: id, ...includedData.attributes}
			const savedSimilarSearch = await insertLongTailUxData(similarSearch)
			return savedSimilarSearch._id
		}))

		const items = extractItemContent(relationships.items.data, includedSearchData)
		page.longTailArticles = await Promise.all(items.articles.map(async(result) => {
			const savedFaqs = await insertLongTailUxData(result)
			return savedFaqs._id
		}))

		page.longTailFaqs = await Promise.all(items.faqs.map(async(result) => {
			const savedArticle = await insertLongTailUxData(result)
			return savedArticle._id
		}))
	}
	return page
}

function extractItemContent(items, includedSearchData) {
	const itemResult = {articles: [], faqs: []}
	items.forEach(item => {
		const id = item.id
		const includedData = _.find(includedSearchData, {id})
		const attributes = includedData.attributes
		let longTailItem = {}
		try {
			longTailItem = JSON.parse(attributes.item_attributes)
		} catch (e) {/** digest error for now **/}
		const savedItem = {
			...{title: attributes.name, snippet: attributes.snippet},
			..._.pick(longTailItem, ['author_image', 'thumbnail_image_url', 'created_at', 'author_name', 'readingTime']),
		}
		const articleData = {
			longTailId: id,
			...attributes,
			...savedItem
		}
		if (longTailItem.faq_type) {
			articleData.type = longTailItem.faq_type
			itemResult.faqs.length <= 9 && itemResult.faqs.push(articleData)
		} else if (longTailItem.article_type) {
			articleData.type = longTailItem.article_type
			itemResult.articles.length <= 9 && itemResult.articles.push(articleData)
		}
	})
	return itemResult
}

async function fetchLongTailData(url) {
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'content-type': 'application/json',
			Authorization: process.env.LONGTAIL_UX_API_KEY,
		},
	})
	if (response.status !== 200) {
		console.log(`${url} returned status: ${response.status}`)
		return null
	}

	return await response.json()
}

async function insertLongTailUxData(data) {
	const options = {
		upsert: true,
		new: true,
		setDefaultsOnInsert: true,
	}
	return LongTailKeywords.model.findOneAndUpdate({
		longTailId: data.longTailId,
		section: data.section,
	}, data, options).exec()
}
