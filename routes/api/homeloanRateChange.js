const keystone = require('keystone')
const HomeLoanRateChange = keystone.list('HomeLoanRateChange')

var CompanyService = require('../../services/CompanyService')

async function getRateChangeObjects (homeLoanRateChanges) {
  homeLoanRateChanges.forEach((homeLoanRateChange) => {
    let company = CompanyService.fixLogoUrl(homeLoanRateChange.company)
    if (company.logo && company.logo.url) {
      company.logo = company.logo.url
    }
    homeLoanRateChange.company = company
  })
  return homeLoanRateChanges
}

exports.list = async function (req, res) {
  let homeLoanRateChanges = await HomeLoanRateChange.model.find({}, {_id: 0}).populate('company').lean().exec()
  let results = await getRateChangeObjects(homeLoanRateChanges)
  res.jsonp(results)
}