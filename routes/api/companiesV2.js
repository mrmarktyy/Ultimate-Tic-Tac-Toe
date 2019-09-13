var keystone = require('keystone')
var mongoose = require('mongoose')

var Company = keystone.list('Company')
var HomeLoanVariation = keystone.list('HomeLoanVariation')
var CompanyHomeLoan = keystone.list('CompanyHomeLoan')
const MULTIPLIER = 5.32

exports.list = async function (req, res) {
  let allCompanies = []
	let companies = await Company.model.find({ $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] }).lean().exec()

  let variationStats = await HomeLoanVariation.model.aggregate([
    { $match: { $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] } },
    { $group: { _id: '$company', count: { $sum: 1 }, clicks: {$sum: '$monthlyClicks'} } },
    { $project: { _id: 0, company_id: '$_id', count: 1, clicks: 1, populatityScore: {$multiply: ['$clicks', MULTIPLIER]} } },
  ])
  for (let i=0; companies.length > i; i++) {
    let company = companies[i]
    let companyStats = variationStats.find((variation) => variation.company_id.toString() === company._id.toString()) || {}
    let hlCompany = await CompanyHomeLoan.model.findOne({company: mongoose.Types.ObjectId(company._id)}).populate('big4ComparisonProduct').lean()

    let response = {
      homeloans_hasRepaymentWidget: null,
      homeloans_big4ComparisonProductUuid: null,
      homeloans_variation_count: companyStats.count || 0,
      homeloans_popularityScore: +(companyStats.populatityScore || 0).toFixed(2),
    }
   if (hlCompany) {
      response[`homeloans_hasRepaymentWidget`] = hlCompany['hasRepaymentWidget'] ? hlCompany['hasRepaymentWidget'] : null
      response[`homeloans_big4ComparisonProductUuid`] = (hlCompany['big4ComparisonProduct'] || null) && hlCompany['big4ComparisonProduct'].uuid
   }
   allCompanies.push({...company, ...response})
  }
  res.jsonp(allCompanies)
}