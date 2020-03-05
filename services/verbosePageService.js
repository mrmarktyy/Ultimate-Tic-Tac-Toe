const fetch = require('node-fetch')
const _ = require('lodash')
var verticals = require('../models/helpers/verticals')

exports.upsertPage = function (page, isDeleted=false) {
	const host = process.env.CONTENT_HOST ? process.env.CONTENT_HOST : 'http://localhost:4400'
	const vertical =  _.find(verticals, {label: page.vertical}) || {}
	const body = {
		type: 'PAGE',
		vertical: vertical.value,
		slug: page.slug,
		url: `/${vertical.value}/leaderboard/${page.slug}`,
		title: page.displayName,
		description: page.description,
		status: page.isDiscontinued ? 'DRAFT' : 'PUBLISHED',
	}
	fetch(`${host}/api/page`, {
		method: isDeleted ? 'delete' : 'post',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
			'api-key': process.env.CONTENT_API_KEY,
		},
	})
		.then(res => res.json())
		.then(json => {
			console.log(json)
		})
}
