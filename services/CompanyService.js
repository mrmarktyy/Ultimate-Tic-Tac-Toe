exports.fixLogoUrl = function (company) {

	if (company.logo) {
		if (company.logo.url) {
			company.logo.url = company.logo.url.replace('res.cloudinary.com', 'production-ultimate-assets.ratecity.com.au')
		}
		if (company.logo.secure_url) {
			company.logo.secure_url = company.logo.secure_url.replace('res.cloudinary.com', 'production-ultimate-assets.ratecity.com.au')
		}
	}

	return company
}
