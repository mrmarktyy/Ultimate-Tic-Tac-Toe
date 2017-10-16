exports.extractWordpressMetadata =  function  (metadata) {
	let page = {
		url: metadata.url,
		header: metadata['page_header'],
		tagline: metadata['page_subheader'],
		title: metadata['_yoast_wpseo_title'],
		resultName: metadata['result_name'],
		description: metadata['_yoast_wpseo_metadesc'],
		keywords: metadata['_yoast_wpseo_focuskw'],
		canonical: metadata['_yoast_wpseo_canonical'],
		vertical: metadata['vertical'],
		category: metadata['category'],
		userJourneyStage: metadata['user_journey_stage'],
		faq_type: metadata['faq_type'],
		faq_url: metadata['faq_url'],
		og: {
			id: metadata['_yoast_wpseo_opengraph-id'],
			title: metadata['_yoast_wpseo_opengraph-title'],
			description: metadata['_yoast_wpseo_opengraph-description'],
			image: metadata['_yoast_wpseo_opengraph-image'],
		},
		twitter: {
			title: metadata['_yoast_wpseo_twitter-title'],
			description: metadata['_yoast_wpseo_twitter-description'],
			creator: metadata['_yoast_wpseo_twitter-author-handle'],
			image: metadata['_yoast_wpseo_twitter-image'],
		},
		google: {
			name: metadata['_yoast_wpseo_googleplus-title'],
			description: metadata['_yoast_wpseo_googleplus-description'],
			image: metadata['_yoast_wpseo_googleplus-image'],
		},
		featuredImage: metadata['featured_image'],
	}

	Object.keys(page).forEach((key) => {
		if (!page[key]) {
			delete page[key]
		} else if (typeof page[key] === 'object') {
			Object.keys(page[key]).forEach((childKey) => {
				if (!page[key][childKey]) {
					delete page[key][childKey]
				}
			})
		}
	})

	return page
}
