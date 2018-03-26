const bankTypes = [
	'regional bank',
	'major bank',
	'foreign bank',
]

exports.fixLogoUrl = function (company) {
	if (company.logo) {
		if (company.logo.url) {
			company.logo.url = company.logo.url.replace('http://res.cloudinary.com', '//production-ultimate-assets.ratecity.com.au')
		}
		if (company.logo.secure_url) {
			company.logo.secure_url = company.logo.secure_url.replace('https://res.cloudinary.com', '//production-ultimate-assets.ratecity.com.au')
		}
	}
	return company
}

exports.isBank = function (company) {
  if (company.type) {
    company.isBank = false
		company.bankType = company.type
    if (bankTypes.includes(company.type.toLowerCase())) {
      company.isBank = true
    }
  }
  return company
}
