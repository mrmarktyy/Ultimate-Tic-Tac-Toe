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

exports.isBank = function (company) {
  if (company.type) {
    company.isBank = false
    if ((company.type.toLowerCase().indexOf('bank') >= 0) && (company.type.toLowerCase() !== 'Non-bank lender')) {
      company.isBank = true
    }
  }
  return company
}
