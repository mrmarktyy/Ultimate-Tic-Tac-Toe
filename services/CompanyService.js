exports.fixLogoUrl = function (company) {
	if (company.logo) {
		if (company.logo.url) {
			company.logo.url = company.logo.url.replace('http://res.cloudinary.com/ratecity/image/upload', '//production-ultimate-assets.ratecity.com.au/ratecity/image/upload/f_auto')
		}
		if (company.logo.secure_url) {
			company.logo.secure_url = company.logo.secure_url.replace('https://res.cloudinary.com', '//production-ultimate-assets.ratecity.com.au')
		}
	}
	return company
}
