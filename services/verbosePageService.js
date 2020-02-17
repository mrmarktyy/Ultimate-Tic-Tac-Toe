const fetch = require('node-fetch')
const _ = require('lodash')
var verticals = require('../models/helpers/verticals')

exports.upsertPage = function (page, isDeleted=false) {
	const host = process.env.CONTENT_HOST ? process.env.CONTENT_HOST : 'http://localhost:4400'
	const vertical =  _.find(verticals, {label: page.vertical}) || {}
	const body = {
		vertical: vertical.value,
		slug: page.slug,
		url: `/${vertical.value}/leaderboard/${page.slug}`,
		title: page.displayName,
		description: page.description,
		status: page.isDiscontinued || isDeleted ? 'DRAFT' : 'PUBLISHED',
	}
	fetch(`${host}/api/pages`, {
		method: 'post',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' },
	})
		.then(res => res.json())
		.then(json => {
			console.log(json)
		})
}
